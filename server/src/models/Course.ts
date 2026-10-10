import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface ICourse {
  title: string;
  description: string;
  content: string;
  category: string;
  instructor: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICourseDocument extends ICourse, Document {}

const courseSchema = new Schema<ICourseDocument>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Course title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Course content is required'],
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      trim: true,
      index: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for efficient instructor course filtering
courseSchema.index({ instructor: 1 });
// Compound index for category filtering and sorted timeline queries
courseSchema.index({ category: 1, createdAt: -1 });

export const Course: Model<ICourseDocument> = model<ICourseDocument>('Course', courseSchema);
export default Course;
