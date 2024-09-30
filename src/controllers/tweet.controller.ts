import { Request, Response } from 'express';
import mongoose, { isValidObjectId } from 'mongoose';
import { Tweet } from '../models/tweet.model';
import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import '../../types/express';

const createTweet = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {
    throw new ApiError(400, 'Tweet content is required');
  }

  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, 'Tweet created successfully'));
});

const getUserTweets = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const tweets = await Tweet.find({ owner: userId })
    .sort({ createdAt: -1 })
    .populate('owner', 'username');

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, 'User tweets fetched successfully'));
});

const updateTweet = asyncHandler(async (req: Request, res: Response) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, 'Invalid tweet ID');
  }

  if (!content || content.trim() === '') {
    throw new ApiError(400, 'Tweet content is required');
  }

  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, 'Tweet not found');
  }

  if (tweet.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this tweet');
  }

  tweet.content = content;
  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, 'Tweet updated successfully'));
});

const deleteTweet = asyncHandler(async (req: Request, res: Response) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, 'Invalid tweet ID');
  }

  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, 'Tweet not found');
  }

  if (tweet.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this tweet');
  }

  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Tweet deleted successfully'));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
