/* The code is defining a Mongoose schema for a task object. */
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    
    id: { type: Number, unique:true, required: true},
    title: { type: String, required: true },
    description: { type: String, required: false },
    completed: { type: Boolean, default: false }
    
});
    
module.exports = mongoose.model('Tasks',taskSchema);