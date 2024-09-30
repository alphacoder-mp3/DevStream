import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { Video } from '../models/video.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadOnCloudinary } from '../utils/cloudinaryService';
import '../../types/express';

const getAllVideos = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const options = {
    page: Number(page),
    limit: Number(limit),
    sort: { [sortBy as string]: sortType === 'desc' ? -1 : 1 },
  };

  const filter: any = {};
  if (query) filter.title = { $regex: query, $options: 'i' };
  if (userId) filter.owner = userId;

  const videos = await Video.aggregatePaginate(
    Video.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },
    ]),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, videos, 'Videos fetched successfully'));
});

const publishAVideo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, 'Title and description are required');
  }

  const videoLocalPath = req.files?.['videoFile']?.[0]?.path;
  const thumbnailLocalPath = req.files?.['thumbnail']?.[0]?.path;

  if (!videoLocalPath) throw new ApiError(400, 'Video file is required');
  if (!thumbnailLocalPath) throw new ApiError(400, 'Thumbnail is required');

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) throw new ApiError(500, 'Video upload failed');
  if (!thumbnail) throw new ApiError(500, 'Thumbnail upload failed');

  if (!req.user?._id) throw new ApiError(401, 'Unauthorized');

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, 'Video published successfully'));
});

const getVideoById = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video ID');
  }

  const video = await Video.findById(videoId).populate(
    'owner',
    'username email'
  );

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video fetched successfully'));
});

const updateVideo = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video ID');
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  if (!req.user?._id) throw new ApiError(401, 'Unauthorized');

  if (video.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this video');
  }

  if (title) video.title = title;
  if (description) video.description = description;

  if (req.file) {
    const thumbnailLocalPath = req.file.path;
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (thumbnail) video.thumbnail = thumbnail.url;
  }

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video updated successfully'));
});

const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video ID');
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  if (!req.user?._id) throw new ApiError(401, 'Unauthorized');

  if (video.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this video');
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Video deleted successfully'));
});

const togglePublishStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, 'Invalid video ID');
    }

    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, 'Video not found');
    }

    if (!req.user?._id) throw new ApiError(401, 'Unauthorized');

    if (video.owner?.toString() !== req.user._id.toString()) {
      throw new ApiError(
        403,
        'You are not authorized to toggle the publish status of this video'
      );
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, video, 'Video publish status toggled successfully')
      );
  }
);

const streamVideo = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video ID');
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  // Assuming the video URL from Cloudinary is stored in video.videoFile
  const videoUrl = video.videoFile;

  // Set the appropriate headers for video streaming
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Accept-Ranges', 'bytes');

  // Use a package like 'axios' or 'node-fetch' to stream the video from Cloudinary
  // Here's a basic example using 'https' module:
  const https = require('https');
  https.get(videoUrl, stream => {
    stream.pipe(res);
  });
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  streamVideo,
};
