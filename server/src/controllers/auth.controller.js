const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try{
        const {email} = req.validatedData;
        const existingUser = await User.findOne({email});
        if (existingUser){
            return res.status(409).json({
                "message": "Email already registered."
            });
        }
        const user = new User(req.validatedData);        
        await user.save();
        res.status(201).json({
            "message": "User registered successfully.",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        });
    }
    catch(err){
        console.error(err);
        if (err.code === 11000){
            return res.status(409).json({
                "message": "Email already registered."
            });
        }
        res.status(500).json({
            message: "Failed to register user."
        });
    }
}

const login = async (req, res) => {
    try{
        const {email} = req.validatedData;
        const existingUser = await User.findOne({email});
        if (!existingUser){
            return res.status(401).json({
                "message": "Invalid email or password."
            });
        }
        const isPasswordValid = await bcrypt.compare(req.validatedData.password, existingUser.password);
        if (!isPasswordValid){
            return res.status(401).json({
                "message": "Invalid email or password."
            });
        }
        const payload = {
            userId: existingUser.id
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});
        res.status(200).json({
            "message": "Login successful.",
            "token": token,
            "user": {
                "id": existingUser.id,
                "name": existingUser.name, 
                "email": existingUser.email
            }
        });
    }
    catch (err){
        console.error(err);
        res.status(500).json({
            "message": "Login failed."
        })
    }
}

module.exports = {register, login};

