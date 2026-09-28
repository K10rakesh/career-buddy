const Tag = require("../models/Tag");

const createDefaultTags = async(userId) => {
    await Tag.create({name: "Work", userId});
    await Tag.create({name: "Study", userId});
    await Tag.create({name: "Personal", userId});
    await Tag.create({name: "Health", userId});
};

module.exports = createDefaultTags;