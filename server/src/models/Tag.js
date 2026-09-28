const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    nameNormalized: {
        type: String,
        required: true
    },
    userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: true
    }
},{
    timestamps: true
});

tagSchema.index({userId: 1, nameNormalized: 1}, {unique: true});

tagSchema.pre("validate", function(){
    this.nameNormalized = this.name.trim().toLowerCase();
})

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;