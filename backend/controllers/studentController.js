import { Student } from '../models/Student.js';
import { createHttpError } from '../middleware/errorHandler.js';

export async function createStudent(req, res, next) {
  try {
    const student = await Student.create(req.validatedBody);
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllStudents(req, res, next) {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (err) {
    next(err);
  }
}

export async function getStudentById(req, res, next) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return next(createHttpError(404, 'Student not found'));
    }
    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.validatedBody, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return next(createHttpError(404, 'Student not found'));
    }
    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return next(createHttpError(404, 'Student not found'));
    }
    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: { id: student._id.toString() },
    });
  } catch (err) {
    next(err);
  }
}
