const User = require("../models/User");

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
        res.status(500).json({
            message: "Failed to register user."
        });
    }
}

module.exports = register;

