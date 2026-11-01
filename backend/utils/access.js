const mongoose = require("mongoose");
const Project = require("../models/Project");
const Task = require("../models/Task");
const HttpError = require("./HttpError");

const sameId = (a, b) => String(a?._id || a) === String(b?._id || b);

const getProjectAsMember = async (projectId, userId) => {
  if (!mongoose.isValidObjectId(projectId)) {
    throw new HttpError(404, "Project not found");
  }
  const project = await Project.findById(projectId);
  if (!project) throw new HttpError(404, "Project not found");
  if (!project.members.some((m) => sameId(m, userId))) {
    throw new HttpError(403, "You are not a member of this project");
  }
  return project;
};

const getProjectAsOwner = async (projectId, userId) => {
  const project = await getProjectAsMember(projectId, userId);
  if (!sameId(project.owner, userId)) {
    throw new HttpError(403, "Only the project owner can do this");
  }
  return project;
};

const getTaskAsMember = async (taskId, userId) => {
  if (!mongoose.isValidObjectId(taskId)) throw new HttpError(404, "Task not found");
  const task = await Task.findById(taskId);
  if (!task) throw new HttpError(404, "Task not found");
  const project = await getProjectAsMember(task.project, userId);
  return { task, project };
};

module.exports = { sameId, getProjectAsMember, getProjectAsOwner, getTaskAsMember };
