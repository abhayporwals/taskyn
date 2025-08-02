import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      required: true,
    },

    // AI-generated challenge metadata
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["code", "reading", "project", "mcq", "mixed"],
      default: "code",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    language: {
      type: String,
      default: "unknown", // dynamically set based on prompt or userPref
      trim: true,
    },

    sampleSolution: {
      type: String,
      default: "",
    },
    expectedOutput: {
      type: String,
      default: "",
    },

    // Submission fields
    isCompleted: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    submissionContent: {
      type: String,
      default: "",
    },
    submissionType: {
      type: String,
      enum: ["text", "file", "code"],
      default: "text",
    },
    reflection: {
      type: String,
      default: "",
    },

    aiFeedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
      default: null,
    },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model("Assignment", assignmentSchema);
