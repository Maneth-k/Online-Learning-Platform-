import { Schema, model, type Document, type Model } from 'mongoose';

export interface IAIUsage {
  key: string;
  count: number;
  limit: number;
  lastUsedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAIUsageDocument extends IAIUsage, Document {}

const aiUsageSchema = new Schema<IAIUsageDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
      trim: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    limit: {
      type: Number,
      required: true,
      default: 200,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const AIUsage: Model<IAIUsageDocument> = model<IAIUsageDocument>('AIUsage', aiUsageSchema);
export default AIUsage;
