import mongoose from 'mongoose';
import { Comment } from '../models/comment.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import '../../types/express';

// Get all comments for a video, with pagination
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate videoId
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video ID');
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // Use `aggregate` to fetch paginated comments for the video
  const comments = await Comment.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    { $sort: { createdAt: -1 } }, // Sort comments by most recent
    { $skip: (pageNum - 1) * limitNum }, // Pagination: skip documents
    { $limit: limitNum }, // Pagination: limit the number of documents returned
  ]);

  // Check total number of comments
  const totalComments = await Comment.countDocuments({ video: videoId });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments, total: totalComments, page: pageNum, limit: limitNum },
        'Comments fetched successfully'
      )
    );
});

// Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  // Validate request parameters
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video ID');
  }
  if (!content) {
    throw new ApiError(400, 'Comment content is required');
  }

  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'User not authenticated');
  }
  // Create a new comment
  const comment = await Comment.create({
    content,
    video: new mongoose.Types.ObjectId(videoId),
    owner: req.user._id, // Assuming req.user is populated with authenticated user
  });

  res
    .status(201)
    .json(new ApiResponse(201, comment, 'Comment added successfully'));
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  // Validate commentId and content
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, 'Invalid comment ID');
  }
  if (!content) {
    throw new ApiError(400, 'Comment content is required');
  }
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'User not authenticated');
  }
  // Find and update the comment
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: req.user._id }, // Only allow owner to update
    { content },
    { new: true } // Return the updated document
  );

  if (!comment) {
    throw new ApiError(404, 'Comment not found or unauthorized');
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, 'Comment updated successfully'));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Validate commentId
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, 'Invalid comment ID');
  }
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'User not authenticated');
  }
  // Find and delete the comment
  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id, // Only allow owner to delete
  });

  if (!comment) {
    throw new ApiError(404, 'Comment not found or unauthorized');
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, 'Comment deleted successfully'));
});

export { getVideoComments, addComment, updateComment, deleteComment };
