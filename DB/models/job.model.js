import mongoose from "mongoose";
const { Schema, model } = mongoose;

//create Job schema
const jobSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: true,
    },
    jobLocation: {
      type: String,
      enum: ["onsite", "remotely", "hybrid"],
      default: "onsite",
    },
    workingTime: {
      type: String,
      enum: ["partTime", "fullTime"],
      default: "fullTime",
    },
    seniorityLevel: {
      type: String,
      enum: ["junior", "midLevel", "senior", "teamLead", "CTO"],
      default: "midLevel",
    },
    jobDescription: {
      type: String,
      required: true,
    },
    technicalSkills: [
      {
        type: String,
        default: [],
      },
    ],
    softSkills: [
      {
        type: String,
        default: [],
      },
    ],
    addedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

//create Job model
export default mongoose.models.Job || model("Job", jobSchema);