const Student = require('../models/student.model.js');
const { createStudentSchema, updateStudentSchema } = require('../validators/studentValidator');

// GET all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    return res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET single student
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// CREATE new student
exports.createStudent = async (req, res) => {
  try {
    // Validate body
    const { error, value } = createStudentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { name, email, grade, parentContact, notes } = value;

    // Example: Check for unique email
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    const newStudent = new Student({ name, email, grade, parentContact, notes });
    const savedStudent = await newStudent.save();
    return res.status(201).json(savedStudent);
  } catch (error) {
    console.error('Error creating student:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE student
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate body
    const { error, value } = updateStudentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { name, email, grade, parentContact, notes } = value;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { name, email, grade, parentContact, notes },
      { new: true } // return the updated doc
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.status(200).json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE student
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};