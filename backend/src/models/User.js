import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:[true,"Username is required"],
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:[true,"E-mail is required"],
        unique:true,
        lowercase:true,
        trim:true,
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    avatarUrl:{
        type:String,
        required:[true,"Avatar is required"]
    },
    authProvider:{
        type:String,
        enum:['local','google'],
        default:'local'
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    streakCount:{
        type:Number,
        default:0
    },
    lastCompletedAt:{
        type:Date,
        default:null
    },
    totalCompleted:{
        type:Number,
        default:0
    },
    onboardingCompleted: {
        type: Boolean,
        default: false,
    },
},{timestamps:true})

export const User=mongoose.model("User",userSchema)



