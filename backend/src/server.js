import dotenv from "dotenv";
import { connectDB } from "./config/db";
import app from "./app";

dotenv.config({
    path: './.env'
});

console.log("PORT:", process.env.PORT);

connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
});