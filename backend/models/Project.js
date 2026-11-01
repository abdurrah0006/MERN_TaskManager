const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [80, "Project name must be 80 characters or fewer"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description must be 300 characters or fewer"],
      default: "",
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    columns: { type: [String], default: ["To Do", "In Progress", "Done"] },
  },
  { timestamps: true }
);

projectSchema.index({ members: 1 });

module.exports = mongoose.model("Project", projectSchema);
