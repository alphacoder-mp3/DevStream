import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import mongoose from 'mongoose';

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
  // Check database connection status
  const dbState = mongoose.connection.readyState;

  // readyState 1 means connected, anything else is not connected
  if (dbState !== 1) {
    throw new ApiError(500, 'Database connection is unhealthy');
  }
  // Build a healthcheck response
  const response = new ApiResponse(200, {}, 'Service is healthy');
  res.status(200).json(response);
});

export { healthcheck };
