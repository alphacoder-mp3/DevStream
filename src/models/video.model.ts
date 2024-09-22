import mongoose, {
  Schema,
  Document,
  Model,
  AggregatePaginateModel,
} from 'mongoose';

interface IVideo extends Document {
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  duration: number;
  views?: number;
  isPublished?: boolean;
  owner?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VideoModel extends Model<IVideo>, AggregatePaginateModel<IVideo> {}

const videoSchema = new Schema<IVideo>(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Video = mongoose.model<IVideo, VideoModel>('Video', videoSchema);
