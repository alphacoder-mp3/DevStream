import mongoose, { Schema, Document } from 'mongoose';

interface ISubscription extends Document {
  subscriber?: mongoose.Types.ObjectId;
  channel?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // who is subscribing
      ref: 'User',
    },
    channel: {
      type: Schema.Types.ObjectId, // the one to whom 'subscribing'
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model<ISubscription>(
  'Subscription',
  subscriptionSchema
);
