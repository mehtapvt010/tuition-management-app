const ClassModel = require('../models/class.model.js');

// GET all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await ClassModel.find().populate('students');
    return res.status(200).json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET single class
exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classDoc = await ClassModel.findById(id).populate('students');
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    return res.status(200).json(classDoc);
  } catch (error) {
    console.error('Error fetching class:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// CREATE new class
exports.createClass = async (req, res) => {
  try {
    const { name, level, students } = req.body;
    const newClass = new ClassModel({ name, level, students });
    const savedClass = await newClass.save();
    return res.status(201).json(savedClass);
  } catch (error) {
    console.error('Error creating class:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE class
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, students } = req.body;

    const updatedClass = await ClassModel.findByIdAndUpdate(
      id,
      { name, level, students },
      { new: true }
    ).populate('students');

    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    return res.status(200).json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE class
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClass = await ClassModel.findByIdAndDelete(id);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    return res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};