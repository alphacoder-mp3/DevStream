import mongoose from 'mongoose';
import { Video } from '../models/video.model';
import { Subscription } from '../models/subscription.model';
import { Like } from '../models/like.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from 'express';

// Get channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats = asyncHandler(async (req: Request, res: Response) => {
  const { channelId } = req.params;

  // Validate channelId
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, 'Invalid channel ID');
  }

  // Fetch total number of videos by the channel
  const totalVideos = await Video.countDocuments({ owner: channelId });

  // Fetch total video views by the channel
  const totalViews = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
    { $group: { _id: null, totalViews: { $sum: '$views' } } },
  ]);

  // Fetch total subscribers for the channel
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  // Fetch total likes across all videos by the channel
  const totalLikes = await Like.countDocuments({
    video: {
      $exists: true,
      $in: await Video.find({ owner: channelId }).distinct('_id'),
    },
  });

  const response = {
    totalVideos,
    totalViews: totalViews.length ? totalViews[0].totalViews : 0,
    totalSubscribers,
    totalLikes,
  };

  res
    .status(200)
    .json(new ApiResponse(200, response, 'Channel stats fetched successfully'));
});

// Get all videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate channelId
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, 'Invalid channel ID');
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // Fetch paginated videos uploaded by the channel
  const videos = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
    { $sort: { createdAt: -1 } },
    { $skip: (pageNum - 1) * limitNum },
    { $limit: limitNum },
  ]);

  // Total number of videos by the channel
  const totalVideos = await Video.countDocuments({ owner: channelId });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, total: totalVideos, page: pageNum, limit: limitNum },
        'Channel videos fetched successfully'
      )
    );
});

export { getChannelStats, getChannelVideos };
