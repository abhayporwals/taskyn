import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected" + connection.connection.host);
    } catch (error) {
        console.log("Coonection Failed to db ", error)
        process.exit(1);
    }
}