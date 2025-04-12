const Task = require('../models/Task')

// @desc Get all tasks
// @route GET /tasks
// @access Public
const getAllTasks = async (req, res) => {
    const tasks = await Task.find().lean()

    // If no tasks found
    if (!tasks?.length) {
        return res.status(400).json({ message: 'No tasks found' })
    }

    res.json(tasks)
}


// @desc Create a new task
// @route POST /tasks
// @access Public
const createNewTask = async (req, res) => {
    const { title, description, dueDate, priority, status } = req.body

    // Confirm required data
    if (!title || !description || !dueDate || !priority || !status) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title (case-insensitive)
    const duplicate = await Task.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate task title' })
    }

    // Create and store the new task
    const task = await Task.create({ title, description, dueDate, priority, status })

    if (task) {
        return res.status(201).json({ message: `New task '${task.title}' created` })
    } else {
        return res.status(400).json({ message: 'Invalid task data received' })
    }
}

// @desc Update a task
// @route PATCH /tasks
// @access Public
const updateTask = async (req, res) => {
    const { id, title, description, dueDate, priority, status } = req.body

    // Confirm data
    if (!id || !title || !description || !dueDate || !priority || !status) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm task exists
    const task = await Task.findById(id).exec()

    if (!task) {
        return res.status(400).json({ message: 'Task not found' })
    }

    // Check for duplicate title (excluding current task)
    const duplicate = await Task.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate task title' })
    }

    // Update task fields
    task.title = title
    task.description = description
    task.dueDate = dueDate
    task.priority = priority
    task.status = status

    const updatedTask = await task.save()

    res.json(`'${updatedTask.title}' updated`)
}

// @desc Delete a task
// @route DELETE /tasks
// @access Public
const deleteTask = async (req, res) => {
    const { id } = req.body

    // Confirm ID provided
    if (!id) {
        return res.status(400).json({ message: 'Task ID required' })
    }

    // Confirm task exists
    const task = await Task.findById(id).exec()

    if (!task) {
        return res.status(400).json({ message: 'Task not found' })
    }

    const result = await task.deleteOne()

    const reply = `Task '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
}


module.exports = {
    getAllTasks,
    createNewTask,
    updateTask,
    deleteTask
}