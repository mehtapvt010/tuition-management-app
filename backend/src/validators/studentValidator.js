const Joi = require('joi');

// For example, let's define a list of valid grades
const validGrades = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '10', '11', '12'
];

exports.createStudentSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  grade: Joi.string().valid(...validGrades).required(),
  parentContact: Joi.object({
    phone: Joi.string().allow(''),
    email: Joi.string().email().allow('')
  }),
  notes: Joi.string().allow('')
});

exports.updateStudentSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  grade: Joi.string().valid(...validGrades).required(),
  parentContact: Joi.object({
    phone: Joi.string().allow(''),
    email: Joi.string().email().allow('')
  }),
  notes: Joi.string().allow('')
});
