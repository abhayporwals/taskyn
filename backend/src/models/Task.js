import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    category: {
      type: String,
      required: true, 
    },
    language: {
      type: String,
      enum: ["js", "go", "python", "none"],
      default: "none",
    },
    expectedOutput: {
      type: String,
      default: "",
    },
    sampleSolution: {
      type: String,
      default: "",
    },
    generatedBy: {
      type: String,
      enum: ["ai", "admin"],
      default: "ai",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
