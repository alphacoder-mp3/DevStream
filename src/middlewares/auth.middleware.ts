import { ApiError } from '../utils/ApiError';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../models/user.model';
import { Request, Response, NextFunction } from 'express';

interface DecodedToken {
  _id: string;
  [key: string]: any;
}

// Extend the Express Request type to include the user property
interface AuthRequest extends Request {
  user?: any;
}

export const verifyJWT = asyncHandler(async (req: AuthRequest, _: Response, next: NextFunction) => {
  try {
    const token = 
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as DecodedToken;

    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid access token');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(401, error.message || 'Invalid access token');
    } else {
      throw new ApiError(401, 'Invalid access token');
    }
  }
});