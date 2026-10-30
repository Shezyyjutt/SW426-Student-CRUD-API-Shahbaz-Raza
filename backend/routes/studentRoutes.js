import { Router } from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { validateObjectId } from '../middleware/errorHandler.js';
import { validateStudentBody } from '../middleware/validateStudent.js';

const router = Router();

router.post('/', validateStudentBody({ partial: false }), createStudent);
router.get('/', getAllStudents);
router.get('/:id', validateObjectId('id'), getStudentById);
router.put('/:id', validateObjectId('id'), validateStudentBody({ partial: true }), updateStudent);
router.delete('/:id', validateObjectId('id'), deleteStudent);

export default router;
