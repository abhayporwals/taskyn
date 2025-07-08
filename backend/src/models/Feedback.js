import mongoose from "mongoose"

const feedbackSchema=new mongoose.Schema({
    assignmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Assignment",
        required:true
    },
    generatedBy:{
        type:String,
        enum:['ai','admin'],
        default:'ai',
    },
    score:{
        type:Number,
        default:0
    },
    feedbackText:{
        type:String,
        required:true
    }
},{timestamps:true})

export const Feedback=mongoose.model("Feedback",feedbackSchema);