const Task = require("../models/Task");
const Comment = require("../models/Comment");
const HttpError = require("../utils/HttpError");
const notify = require("../utils/notify");
const { sameId, getProjectAsMember, getTaskAsMember } = require("../utils/access");
const { projectRoom } = require("../sockets/socket");

const PRIORITIES = ["low", "medium", "high"];
const ASSIGNEE_FIELDS = "name email";

// Validate only the fields that were sent, so the same logic serves create and update.
const readFields = (body, project) => {
  const fields = {};

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) throw new HttpError(400, "Task title is required");
    fields.title = title;
  }
  if (body.description !== undefined) fields.description = String(body.description);
  if (body.status !== undefined) {
    if (!project.columns.includes(body.status)) throw new HttpError(400, "Unknown column");
    fields.status = body.status;
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) throw new HttpError(400, "Invalid priority");
    fields.priority = body.priority;
  }
  if (body.dueDate !== undefined) {
    if (!body.dueDate) {
      fields.dueDate = null;
    } else {
      const date = new Date(body.dueDate);
      if (Number.isNaN(date.getTime())) throw new HttpError(400, "Invalid due date");
      fields.dueDate = date;
    }
  }
  if (body.assignedTo !== undefined) {
    if (!body.assignedTo) {
      fields.assignedTo = null;
    } else {
      if (!project.members.some((m) => sameId(m, body.assignedTo))) {
        throw new HttpError(400, "Assignee must be a project member");
      }
      fields.assignedTo = body.assignedTo;
    }
  }

  return fields;
};

const notifyAssignee = (req, task, project) => {
  if (!task.assignedTo || sameId(task.assignedTo, req.user._id)) return;
  return notify(req.app.get("io"), [task.assignedTo._id || task.assignedTo], {
    message: `${req.user.name} assigned you "${task.title}" in "${project.name}"`,
    type: "task",
    link: `/projects/${project._id}`,
  });
};

exports.createTask = async (req, res) => {
  const project = await getProjectAsMember(req.body.projectId, req.user._id);
  if (req.body.title === undefined) throw new HttpError(400, "Task title is required");

  const task = await Task.create({
    status: project.columns[0],
    ...readFields(req.body, project),
    project: project._id,
    createdBy: req.user._id,
  });
  await task.populate("assignedTo", ASSIGNEE_FIELDS);

  req.app.get("io").to(projectRoom(project._id)).emit("taskCreated", task);
  await notifyAssignee(req, task, project);

  res.status(201).json(task);
};

exports.getTasksByProject = async (req, res) => {
  const project = await getProjectAsMember(req.params.projectId, req.user._id);
  const tasks = await Task.find({ project: project._id })
    .populate("assignedTo", ASSIGNEE_FIELDS)
    .sort({ createdAt: -1 });
  res.json(tasks);
};

// Everything assigned to the current user across all projects.
exports.getMyTasks = async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user._id })
    .populate("project", "name columns")
    .sort({ dueDate: 1, createdAt: -1 });
  res.json(tasks);
};

exports.updateTask = async (req, res) => {
  const { task, project } = await getTaskAsMember(req.params.id, req.user._id);
  const previousAssignee = String(task.assignedTo || "");

  task.set(readFields(req.body, project));
  await task.save();
  await task.populate("assignedTo", ASSIGNEE_FIELDS);

  req.app.get("io").to(projectRoom(project._id)).emit("taskUpdated", task);
  if (String(task.assignedTo?._id || "") !== previousAssignee) {
    await notifyAssignee(req, task, project);
  }

  res.json(task);
};

exports.deleteTask = async (req, res) => {
  const { task, project } = await getTaskAsMember(req.params.id, req.user._id);

  await Promise.all([task.deleteOne(), Comment.deleteMany({ task: task._id })]);

  req.app.get("io").to(projectRoom(project._id)).emit("taskDeleted", { _id: task._id });
  res.json({ message: "Task deleted" });
};
