import { SEMESTER_MIN, SEMESTER_MAX } from '../models/Student.js';
import { createHttpError } from './errorHandler.js';

const ALLOWED_FIELDS = ['name', 'rollNo', 'department', 'semester'];
const FORBIDDEN_FIELDS = ['_id', 'id', '__v', 'createdAt', 'updatedAt'];

function trimString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

/**
 * Validate student payload for create (all fields required) or update (partial).
 */
export function validateStudentBody({ partial = false } = {}) {
  return (req, res, next) => {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return next(createHttpError(400, 'Request body must be a JSON object'));
    }

    for (const key of Object.keys(body)) {
      if (FORBIDDEN_FIELDS.includes(key)) {
        return next(createHttpError(400, `Field "${key}" cannot be modified`));
      }
      if (!ALLOWED_FIELDS.includes(key)) {
        return next(createHttpError(400, `Unknown field "${key}"`));
      }
    }

    const errors = [];

    if (!partial) {
      for (const field of ALLOWED_FIELDS) {
        if (body[field] === undefined || body[field] === null) {
          errors.push(`${field} is required`);
        }
      }
    } else if (Object.keys(body).length === 0) {
      return next(createHttpError(400, 'At least one field is required to update'));
    }

    const normalized = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string') {
        errors.push('Name must be a string');
      } else {
        const name = trimString(body.name);
        if (!name) errors.push('Name cannot be empty');
        else normalized.name = name;
      }
    }

    if (body.rollNo !== undefined) {
      if (typeof body.rollNo !== 'string') {
        errors.push('Roll number must be a string');
      } else {
        const rollNo = trimString(body.rollNo);
        if (!rollNo) errors.push('Roll number cannot be empty');
        else normalized.rollNo = rollNo;
      }
    }

    if (body.department !== undefined) {
      if (typeof body.department !== 'string') {
        errors.push('Department must be a string');
      } else {
        const department = trimString(body.department);
        if (!department) errors.push('Department cannot be empty');
        else normalized.department = department;
      }
    }

    if (body.semester !== undefined) {
      const semester = body.semester;
      if (typeof semester === 'string' && semester.trim() !== '') {
        errors.push('Semester must be a number');
      } else if (typeof semester !== 'number' || !Number.isInteger(semester)) {
        errors.push('Semester must be an integer');
      } else if (semester < SEMESTER_MIN || semester > SEMESTER_MAX) {
        errors.push(`Semester must be between ${SEMESTER_MIN} and ${SEMESTER_MAX}`);
      } else {
        normalized.semester = semester;
      }
    }

    if (errors.length > 0) {
      return next(createHttpError(400, 'Validation failed', errors));
    }

    req.validatedBody = normalized;
    next();
  };
}
