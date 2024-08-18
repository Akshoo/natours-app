import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import dotenv from 'dotenv/config';
import mongoose from 'mongoose';
import Tour from './../models/tourModel.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tours = JSON.parse(
    fs.readFileSync(
        `${__dirname}/../../dev-data/data/tours-simple.json`,
        'utf8'
    )
);

const dbUri = process.env.DB_URI.replace(
    '<PASSWORD>',
    process.env.DB_PASSWORD
);
const init = async function () {
    try {
        await mongoose.connect(dbUri);
        console.log(
            'connection to database successfull from script'
        );
    } catch (err) {
        console.log(err);
    }
};
init();

// Import data to DB
const importData = async function () {
    try {
        await Tour.create(tours);
        console.log('DATA added to datbase');
    } catch (err) {
        console.log(err.message);
    }
    process.exit();
};
// Delete all data from DB
const deleteAllDAta = async function () {
    try {
        await Tour.deleteMany();
        console.log('DATA deleted from database');
    } catch (err) {
        console.log(err.message);
    }
    process.exit();
};

if (process.argv[2] == '--import') importData();
if (process.argv[2] == '--delete') deleteAllDAta();
