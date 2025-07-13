import dotenv from "dotenv";
dotenv.config({
    path: './.env'
});

import { connectDB } from "./config/db.js";
import app from "./app.js";


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