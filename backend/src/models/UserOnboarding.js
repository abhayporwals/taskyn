import mongoose from "mongoose"

const userOnboardingSchema = new mongoose.Schema({
    interests:{
        type: [String],
        default: [],
    },
    primaryGoals:{
        type: [String],
        default: [],
    },
    secondaryGoals:{
        type: [String],
        default: [],
    },
    skillLevels:{
        type:Map,
        of:{
            type:String,
            enum:['beginner', 'intermediate', 'advanced'],
        },
        default:{},
    },
    preferredTopics:{
        type: [String],
        default: [],
    },
    learningStyle:{
        type:String,
        enum:['assignment-only', 'resources-only', 'both'],
        default:'both'
    },
    preferredAssignmentType:{
        type:String,
        enum:['project', 'problem-solving', 'reading-based', 'mixed'],
        default:'mixed'
    },
    yearsOfExperience:{
        type:Number,
        default:0
    },
    priorProjects:{
        type: [String],
        default:[],
    },
    githubUrl: {
        type: String,
        default: "",
    },
    portfolioUrl: {
        type: String,
        default: "",
    },
    availableHoursPerWeek: {
        type: Number,
        required: true,
    },
    preferredLanguage: {
        type: String,
        required: true,
    },
    wantsFeedback: {
        type: Boolean,
        default: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    version: {
        type: Number,
        default: 1,
    },
},{timestamps:true})

export const UserOnboarding = mongoose.model("UserOnboarding", userOnboardingSchema);



