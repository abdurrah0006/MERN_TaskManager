const Project = require("../models/Project");
const Task = require("../models/Task");
const Comment = require("../models/Comment");
const User = require("../models/User");
const HttpError = require("../utils/HttpError");
const notify = require("../utils/notify");
const { sameId, getProjectAsMember, getProjectAsOwner } = require("../utils/access");
const { projectRoom, userRoom } = require("../sockets/socket");

const MEMBER_FIELDS = "name email";
const MAX_COLUMN_NAME = 40;

// Populate, broadcast to everyone on the board, and return the project.
const publish = async (req, project) => {
  await project.populate("members", MEMBER_FIELDS);
  req.app.get("io").to(projectRoom(project._id)).emit("projectUpdated", project);
  return project;
};

const cleanColumnName = (value) => {
  const name = String(value || "").trim();
  if (!name) throw new HttpError(400, "Column name is required");
  if (name.length > MAX_COLUMN_NAME) {
    throw new HttpError(400, `Column name must be ${MAX_COLUMN_NAME} characters or fewer`);
  }
  return name;
};

const hasColumn = (project, name) =>
  project.columns.some((c) => c.toLowerCase() === name.toLowerCase());

exports.createProject = async (req, res) => {
  const project = await Project.create({
    name: req.body.name,
    description: req.body.description,
    owner: req.user._id,
    members: [req.user._id],
  });
  await project.populate("members", MEMBER_FIELDS);
  res.status(201).json(project);
};

// Each project comes back with task totals so the dashboard can show progress.
exports.getProjects = async (req, res) => {
  const projects = await Project.find({ members: req.user._id })
    .populate("members", MEMBER_FIELDS)
    .sort({ updatedAt: -1 })
    .lean();

  const counts = await Task.aggregate([
    { $match: { project: { $in: projects.map((p) => p._id) } } },
    { $group: { _id: { project: "$project", status: "$status" }, n: { $sum: 1 } } },
  ]);

  const result = projects.map((project) => {
    const doneColumn = project.columns[project.columns.length - 1];
    const own = counts.filter((c) => sameId(c._id.project, project._id));
    return {
      ...project,
      taskCount: own.reduce((sum, c) => sum + c.n, 0),
      doneCount: own.filter((c) => c._id.status === doneColumn).reduce((sum, c) => sum + c.n, 0),
    };
  });

  res.json(result);
};

exports.getProject = async (req, res) => {
  const project = await getProjectAsMember(req.params.id, req.user._id);
  await project.populate("members", MEMBER_FIELDS);
  res.json(project);
};

exports.updateProject = async (req, res) => {
  const project = await getProjectAsOwner(req.params.id, req.user._id);

  if (req.body.name !== undefined) project.name = req.body.name;
  if (req.body.description !== undefined) project.description = req.body.description;
  await project.save();

  res.json(await publish(req, project));
};

exports.deleteProject = async (req, res) => {
  const project = await getProjectAsOwner(req.params.id, req.user._id);

  await Promise.all([
    Task.deleteMany({ project: project._id }),
    Comment.deleteMany({ project: project._id }),
    project.deleteOne(),
  ]);

  const io = req.app.get("io");
  project.members.forEach((m) => io.to(userRoom(m)).emit("projectRemoved", { projectId: project._id }));

  res.json({ message: "Project deleted" });
};

// ---- Members ---------------------------------------------------------------

exports.addMember = async (req, res) => {
  const project = await getProjectAsOwner(req.params.id, req.user._id);
  const email = String(req.body.email || "").trim().toLowerCase();

  const user = await User.findOne({ email });
  if (!user) throw new HttpError(404, "No account found with that email");
  if (project.members.some((m) => sameId(m, user._id))) {
    throw new HttpError(400, `${user.name} is already a member`);
  }

  project.members.push(user._id);
  await project.save();

  await notify(req.app.get("io"), [user._id], {
    message: `${req.user.name} added you to "${project.name}"`,
    type: "project",
    link: `/projects/${project._id}`,
  });

  res.status(201).json(await publish(req, project));
};

exports.removeMember = async (req, res) => {
  const project = await getProjectAsMember(req.params.id, req.user._id);
  const { userId } = req.params;
  const isOwner = sameId(project.owner, req.user._id);

  if (sameId(project.owner, userId)) {
    throw new HttpError(400, "The project owner can't be removed");
  }
  if (!isOwner && !sameId(userId, req.user._id)) {
    throw new HttpError(403, "Only the owner can remove other members");
  }
  if (!project.members.some((m) => sameId(m, userId))) {
    throw new HttpError(404, "That user is not a member");
  }

  project.members = project.members.filter((m) => !sameId(m, userId));
  await project.save();
  await Task.updateMany({ project: project._id, assignedTo: userId }, { assignedTo: null });

  const io = req.app.get("io");
  io.to(userRoom(userId)).emit("projectRemoved", { projectId: project._id });
  io.in(userRoom(userId)).socketsLeave(projectRoom(project._id));

  res.json(await publish(req, project));
};

// ---- Columns ---------------------------------------------------------------

exports.addColumn = async (req, res) => {
  const project = await getProjectAsMember(req.params.id, req.user._id);
  const name = cleanColumnName(req.body.name);
  if (hasColumn(project, name)) throw new HttpError(409, "A column with that name already exists");

  project.columns.push(name);
  await project.save();
  res.status(201).json(await publish(req, project));
};

exports.renameColumn = async (req, res) => {
  const project = await getProjectAsMember(req.params.id, req.user._id);
  const oldName = req.params.name;
  const newName = cleanColumnName(req.body.name);

  if (!project.columns.includes(oldName)) throw new HttpError(404, "Column not found");
  if (newName.toLowerCase() !== oldName.toLowerCase() && hasColumn(project, newName)) {
    throw new HttpError(409, "A column with that name already exists");
  }

  project.columns = project.columns.map((c) => (c === oldName ? newName : c));
  await project.save();
  await Task.updateMany({ project: project._id, status: oldName }, { status: newName });

  res.json(await publish(req, project));
};

// Tasks in a deleted column move to the first remaining column.
exports.deleteColumn = async (req, res) => {
  const project = await getProjectAsMember(req.params.id, req.user._id);
  const name = req.params.name;

  if (!project.columns.includes(name)) throw new HttpError(404, "Column not found");
  if (project.columns.length === 1) throw new HttpError(400, "A project needs at least one column");

  project.columns = project.columns.filter((c) => c !== name);
  await project.save();
  await Task.updateMany({ project: project._id, status: name }, { status: project.columns[0] });

  res.json(await publish(req, project));
};
