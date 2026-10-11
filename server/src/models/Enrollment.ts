import { Schema, model, type Document, type Model, Types } from 'mongoose';

export type EnrollmentStatus = 'enrolled' | 'completed' | 'dropped';

export interface IEnrollment {
  student: Types.ObjectId;
  course: Types.ObjectId;
  status: EnrollmentStatus;
  enrollmentDate: Date;
  completedAt?: Date | null;
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
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['enrolled', 'completed', 'dropped'],
        message: '{VALUE} is not a valid enrollment status',
      },
      default: 'enrolled',
      trim: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
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
