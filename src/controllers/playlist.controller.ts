import { Request, Response } from 'express';
import mongoose, { isValidObjectId } from 'mongoose';
import { Playlist } from '../models/playlist.model';
import { Video } from '../models/video.model';
import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import '../../types/express';

const createPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, 'Name and description are required');
  }

  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, 'Playlist created successfully'));
});

const getUserPlaylists = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const playlists = await Playlist.find({ owner: userId })
    .populate('owner', 'username')
    .populate('videos', 'title thumbnail');

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, 'User playlists fetched successfully')
    );
});

const getPlaylistById = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, 'Invalid playlist ID');
  }

  const playlist = await Playlist.findById(playlistId)
    .populate('owner', 'username')
    .populate('videos', 'title thumbnail duration');

  if (!playlist) {
    throw new ApiError(404, 'Playlist not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Playlist fetched successfully'));
});

const addVideoToPlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid playlist ID or video ID');
  }

  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, 'Playlist not found');
  }

  if (playlist.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to modify this playlist');
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  if (!playlist.videos?.includes(video._id)) {
    playlist.videos?.push(video._id);
    await playlist.save();
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, 'Video added to playlist successfully')
    );
});

const removeVideoFromPlaylist = asyncHandler(
  async (req: Request, res: Response) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
      throw new ApiError(400, 'Invalid playlist ID or video ID');
    }

    if (!req.user?._id) {
      throw new ApiError(401, 'Unauthorized');
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new ApiError(404, 'Playlist not found');
    }

    if (playlist.owner?.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You are not authorized to modify this playlist');
    }

    playlist.videos = playlist.videos?.filter(id => id.toString() !== videoId);

    await playlist.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          playlist,
          'Video removed from playlist successfully'
        )
      );
  }
);

const deletePlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, 'Invalid playlist ID');
  }

  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, 'Playlist not found');
  }

  if (playlist.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this playlist');
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Playlist deleted successfully'));
});

const updatePlaylist = asyncHandler(async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, 'Invalid playlist ID');
  }

  if (!name && !description) {
    throw new ApiError(
      400,
      'At least one field (name or description) is required to update'
    );
  }

  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, 'Playlist not found');
  }

  if (playlist.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this playlist');
  }

  if (name) playlist.name = name;
  if (description) playlist.description = description;

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Playlist updated successfully'));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
