import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const DBConnection = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGODB);
        console.log(`DATABASE CONNECTED: ${connection.host}`);
    } catch (error) {
        console.error(`DATABASE ERROR: ${error}`);
        process.exit(1);
    }
}

export default DBConnection;