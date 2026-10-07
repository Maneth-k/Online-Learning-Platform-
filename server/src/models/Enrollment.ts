import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface IEnrollment {
  student: Types.ObjectId;
  course: Types.ObjectId;
  status: string;
  enrollmentDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEnrollmentDocument extends IEnrollment, Document {}

const enrollmentSchema = new Schema<IEnrollmentDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    status: {
      type: String,
      default: 'enrolled',
      trim: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound unique index to prevent a student from enrolling in the same course multiple times
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Query indexes for instructor student listings and student enrollment dashboards
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ student: 1, status: 1 });

export const Enrollment: Model<IEnrollmentDocument> = model<IEnrollmentDocument>('Enrollment', enrollmentSchema);
export default Enrollment;
