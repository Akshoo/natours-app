import dotenv from 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const dbUri = process.env.DB_URI.replace(
    '<PASSWORD>',
    process.env.DB_PASSWORD
);
const init = async function () {
    try {
        mongoose.connect(dbUri).then(() => {
            console.log(
                'connection to database successfull'
            );
        });

        app.listen(
            process.env.PORT || 3000,
            process.env.HOST || 'localhost',
            () =>
                console.log(
                    `server started at ${
                        process.env.PORT || 3000
                    }`
                )
        );
    } catch (err) {
        console.log(err);
    }
};
init();
