import mongoose, { Schema, Document, Model } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

interface IComment extends Document {
  content: string;
  video?: Schema.Types.ObjectId;
  owner?: Schema.Types.ObjectId;
  createdAt?: Date; // Timestamps are handled by mongoose
  updatedAt?: Date; // Timestamps are handled by mongoose
}
interface ICommentModel extends Model<IComment> {
  aggregatePaginate: typeof mongooseAggregatePaginate;
}
const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model<IComment, ICommentModel>(
  'Comment',
  commentSchema
);
