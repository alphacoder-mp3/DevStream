import mongoose, { Schema, Document } from 'mongoose';

interface IPlaylist extends Document {
  name: string;
  description: string;
  videos?: mongoose.Types.ObjectId[];
  owner?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const playlistSchema = new Schema<IPlaylist>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
