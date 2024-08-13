import { isValidObjectId } from 'mongoose';
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Subscription } from '../models/subscription.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

interface CustomRequest extends Request {
  user?: {
    _id: string;
  };
}

// Toggle subscription method
const toggleSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const { userId } = req.body || { userId: (req as CustomRequest).user?._id }; // Assuming userId is sent in the request body

  if (!isValidObjectId(channelId) || !isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid channelId or userId');
  }

  const channel = await User.findById(channelId);
  const subscriber = await User.findById(userId);

  if (!channel || !subscriber) {
    throw new ApiError(404, 'Channel or subscriber not found');
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscription) {
    // Unsubscribe
    await Subscription.deleteOne({ _id: existingSubscription._id });
    res.status(200).json(new ApiResponse(200, {}, 'Unsubscribed successfully'));
  } else {
    // Subscribe
    const newSubscription = new Subscription({
      subscriber: userId,
      channel: channelId,
    });
    await newSubscription.save();
    res.status(200).json(new ApiResponse(200, {}, 'Subscribed successfully'));
  }
});

// Get subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
      throw new ApiError(400, 'Invalid channelId');
    }

    const subscribers = await Subscription.find({
      channel: subscriberId,
    }).populate('subscriber');

    if (!subscribers) {
      throw new ApiError(404, 'No subscribers found');
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, subscribers, 'Subscribers retrieved successfully')
      );
  }
);

// Get channels to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, 'Invalid subscriberId');
  }

  const channels = await Subscription.find({
    subscriber: channelId,
  }).populate('channel');

  if (!channels) {
    throw new ApiError(404, 'No channels found');
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channels,
        'Subscribed channels retrieved successfully'
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
