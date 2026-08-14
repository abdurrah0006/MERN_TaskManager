const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    columns: {
      type: [String],
      default: ["To Do", "In Progress", "Done"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);