const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
};

// Student Schema
const studentSchema = Joi.object({
  name: Joi.string().required(),
  roll_number: Joi.string().required(),
  branch: Joi.string().required(),
  email: Joi.string().email(),
  phone: Joi.string(),
  cgpa: Joi.number().min(0).max(10),
  attendance_percentage: Joi.number().min(0).max(100),
  coding_score: Joi.number().min(0).max(1000),
  communication_score: Joi.number().min(0).max(100),
  projects_count: Joi.number().min(0),
  internships_count: Joi.number().min(0),
  placement_status: Joi.string().valid('placed', 'unplaced', 'at_risk', 'in_process'),
  company: Joi.string(),
  package: Joi.string()
});

// College Schema
const collegeSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  pincode: Joi.string(),
  phone: Joi.string(),
  email: Joi.string().email(),
  website: Joi.string().uri(),
  established_year: Joi.number().integer().min(1900)
});

// Placement Schema
const placementSchema = Joi.object({
  student_id: Joi.string().uuid().required(),
  company_id: Joi.string().uuid().required(),
  package_amount: Joi.number().positive().required(),
  package_currency: Joi.string().default('INR'),
  offer_date: Joi.date(),
  joining_date: Joi.date(),
  position: Joi.string(),
  location: Joi.string(),
  status: Joi.string().valid('offered', 'accepted', 'rejected', 'joined'),
  is_dream_offer: Joi.boolean()
});

// College Registration Schema
const collegeRegistrationSchema = Joi.object({
  college_name: Joi.string().required(),
  college_code: Joi.string().required(),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  pincode: Joi.string(),
  phone: Joi.string(),
  email: Joi.string().email(),
  website: Joi.string().uri(),
  established_year: Joi.number().integer().min(1900),
  admin_name: Joi.string().required(),
  admin_email: Joi.string().email().required(),
  admin_phone: Joi.string(),
  message: Joi.string()
});

module.exports = { 
  validate, 
  studentSchema, 
  collegeSchema, 
  placementSchema,
  collegeRegistrationSchema
};
