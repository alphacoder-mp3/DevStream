import mongoose, { Schema } from 'mongoose';

const subscriptionSchema = new Schema(
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

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
