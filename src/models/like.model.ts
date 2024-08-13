import mongoose, { Schema } from 'mongoose';

interface ILike extends Document {
  video?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  tweet?: mongoose.Types.ObjectId;
  likedBy?: mongoose.Types.ObjectId;
  createdAt?: Date; // Timestamps are handled by mongoose
  updatedAt?: Date; // Timestamps are handled by mongoose
}

const likeSchema = new Schema<ILike>(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet',
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model<ILike>('Like', likeSchema);
