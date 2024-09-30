import mongoose, { isValidObjectId } from 'mongoose';
import { Like } from '../models/like.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from 'express';
import '../../types/express';

const toggleLike = async (
  modelType: string,
  id: string,
  userId: mongoose.Types.ObjectId
) => {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${modelType} ID`);
  }

  const existingLike = await Like.findOne({
    [modelType]: id,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return new ApiResponse(200, {}, `${modelType} un-liked successfully`);
  } else {
    await Like.create({
      [modelType]: id,
      likedBy: userId,
    });
    return new ApiResponse(200, {}, `${modelType} liked successfully`);
  }
};

const toggleVideoLike = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'User not authenticated');
  }

  const response = await toggleLike(
    'video',
    videoId,
    new mongoose.Types.ObjectId(req.user._id) // Convert userId to ObjectId
  );
  res.status(response.statusCode).json(response);
});

const toggleCommentLike = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;

  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'User not authenticated');
  }

  const response = await toggleLike(
    'comment',
    commentId,
    new mongoose.Types.ObjectId(req.user._id) // Convert userId to ObjectId
  );
  res.status(response.statusCode).json(response);
});

const toggleTweetLike = asyncHandler(async (req: Request, res: Response) => {
  const { tweetId } = req.params;

  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'User not authenticated');
  }

  const response = await toggleLike(
    'tweet',
    tweetId,
    new mongoose.Types.ObjectId(req.user._id) // Convert userId to ObjectId
  );
  res.status(response.statusCode).json(response);
});

const getLikedVideos = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'User not authenticated');
  }

  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true },
  })
    .populate('video')
    .sort('-createdAt');

  if (!likedVideos.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], 'No liked videos found'));
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, 'Liked videos fetched successfully')
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
