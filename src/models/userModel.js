import crypto from 'crypto';
import { promisify } from 'util';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'a user must have a valid email'],
        unique: true,
        // validate: {
        //     validator: validator.isEmail,
        // },
        validate: [validator.isEmail, 'Please enter a valid email id'],
    },
    name: {
        type: String,
        required: [true, 'a user must have a name'],
        trim: true,
        minLength: [10, 'name must be of min 10 characters'],
        maxLength: [40, 'name must be of max 40 characters'],
    },
    password: {
        type: String,
        required: [true, 'a user must have a valid password'],
        minLength: [8, 'password must be atleast 8 characters'],
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: true,
        validate: {
            // this will only run for SAVE and CREATE
            validator: function (val) {
                return val === this.password;
            },
            message: 'Please confirm the password correctly',
        },
    },
    photo: String,
    passwordChangedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'lead-guide', 'guide'],
        default: 'user',
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

// Hooks

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

// Instance Methods

userSchema.methods.correctPassword = async function (candidatePass, userPass) {
    return await bcrypt.compare(candidatePass, userPass);
};

userSchema.methods.changedPasswordAfterTime = function (time) {
    const changedAt = new Date(this.passwordChangedAt || this.createdAt || 0);
    const chkTime = new Date(time);

    return changedAt > chkTime;
};
userSchema.methods.createPasswordResetToken = async function () {
    const token = (await promisify(crypto.randomBytes)(32)).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 1000 * 60; // 10 mins

    await this.save({ validateBeforeSave: false });

    return token;
};
userSchema.methods.deletePasswordResetToken = async function () {
    // this.passwordResetToken = undefined;
    // this.passwordResetTokenExpires = undefined;
    // await this.save({ validateBeforeSave: false });
};

const User = new mongoose.model('user', userSchema);
export default User;
