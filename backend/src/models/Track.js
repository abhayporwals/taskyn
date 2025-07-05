import mongoose from "mongoose"

const trackSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    title:{
        type:String,
        required:[true,"Title is required"],
    },
    category:{
        type:[String],
        required:true,
    },
    status:{
        type:String,
        enum:['active', 'completed', 'archived'],
        default:'active'
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    generatedBy: {
      type: String,
      enum: ['ai', 'admin'],
      default: 'ai',
    }},{
        timestamps:true
    }
)

export const Track = mongoose.model("Track", trackSchema);
