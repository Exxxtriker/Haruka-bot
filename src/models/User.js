const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    stamina: { type: Number, default: 10 },
    lastInteraction: { type: Number, default: Date.now },
    inventory: {
        type: Map,
        of: Number,
        default: {},
    },
});

module.exports = mongoose.model('User', userSchema);
