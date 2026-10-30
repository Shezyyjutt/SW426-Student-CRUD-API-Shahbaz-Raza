import mongoose from 'mongoose';

const SEMESTER_MIN = 1;
const SEMESTER_MAX = 8;

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [1, 'Name cannot be empty'],
    },
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
      unique: true,
      minlength: [1, 'Roll number cannot be empty'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      minlength: [1, 'Department cannot be empty'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [SEMESTER_MIN, `Semester must be between ${SEMESTER_MIN} and ${SEMESTER_MAX}`],
      max: [SEMESTER_MAX, `Semester must be between ${SEMESTER_MIN} and ${SEMESTER_MAX}`],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Student = mongoose.model('Student', studentSchema);
export { SEMESTER_MIN, SEMESTER_MAX };
