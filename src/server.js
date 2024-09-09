import dotenv from 'dotenv/config';
import mongoose from 'mongoose';
process.on('uncaughtException', (err) => {
    console.error('💥💥💥', err);
    console.warn('UNEXPECTED ERROR, SHUTTING DOWN... 🫡');
    server.close(() => process.exit(1));
});

import app from './app.js';

// Keeping Password secure
const dbUri = process.env.DB_URI.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(dbUri).then(() => {
    console.log('connection to database successfull');
});

const server = app.listen(
    process.env.PORT || 3000,
    process.env.HOST || 'localhost',
    () => console.log(`server started at ${process.env.PORT || 3000}`)
);
