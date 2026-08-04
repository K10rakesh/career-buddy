const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
    },{
        timestamps: true
    });
userSchema.pre('save', async function () {
    if (!this.isModified("password")){
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});
const User = mongoose.model("User", userSchema);

module.exports = User;