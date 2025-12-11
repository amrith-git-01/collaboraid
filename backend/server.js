const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: './config.env', quiet: true });

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const connectDB = async () => {
    try {
        await mongoose.connect(DB, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        }).then(() => console.log('DB connection successful!'));
    } catch (error) {
        console.log(error.message);
    }
}
connectDB();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled rejection! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', (err) => {
    console.log('Uncaught exception! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});