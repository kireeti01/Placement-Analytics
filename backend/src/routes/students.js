const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  bulkCreateStudents,
  updateStudent,
  deleteStudent,
  getStudentsByCollege,
  getStudentStats
} = require('../controllers/studentController');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { validate, studentSchema } = require('../middleware/validation');

router.get('/', authMiddleware, getAllStudents);
router.get('/stats', authMiddleware, getStudentStats);
router.get('/college/:collegeId', authMiddleware, getStudentsByCollege);
router.get('/:id', authMiddleware, getStudentById);
router.post('/', authMiddleware, requireAdmin, validate(studentSchema), createStudent);
router.post('/bulk', authMiddleware, requireAdmin, bulkCreateStudents);
router.put('/:id', authMiddleware, requireAdmin, updateStudent);
router.delete('/:id', authMiddleware, requireAdmin, deleteStudent);

module.exports = router;
