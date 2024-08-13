import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { User, IUser } from '../models/user.model';
import { uploadOnCloudinary } from '../utils/cloudinaryService';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const options: { httpOnly: boolean; secure: boolean } = {
  httpOnly: true,
  secure: true,
};

interface Tokens {
  accessToken: string;
  refreshToken: string;
}
interface AuthRequest extends Request {
  user?: IUser;
}

const generateAccessAndRefreshTokens = async (
  userId: string
): Promise<Tokens> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while generating refresh and access token'
    );
  }
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  // get user details for registration from req
  const { fullName, email, username, password } = req.body;

  // validation - not empty
  if (
    [fullName, email, username, password].some(field => field?.trim() === '')
  ) {
    throw new ApiError(400, 'All fields required');
  }

  //check if user already exists: username, email
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new ApiError(409, 'User with email or username already exists');
  }
  // check for images, check for avatar, coverImage
  // const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const avatarLocalPath = (
    req.files as { [fieldname: string]: Express.Multer.File[] }
  )?.avatar?.[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath: string | undefined;
  if (req.files && 'coverImage' in req.files) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is required');
  }
  // upload those images to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, 'Avatar file is required');
  }

  //create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
    email,
    password,
    username: username.toLowerCase(),
  });

  //remove password and refresh token fields from response
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  //check for created user
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering');
  }

  //return res
  res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User registered successfully'));
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  // extract username and password from user req
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookie
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, 'username or email is required');
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, 'User does not exist');
  }

  const isPasswordValid = await user.isPasswordCorrect(password); // we are making use of user not User here, since we are added isPasswordCorrect on our user obj.

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid user credentials');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id.toString()
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  //   const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User logged in successfully'
      )
    );
});

const logoutUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1, // removes field from the document
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out'));
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request ');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    if (typeof decodedToken === 'string' || !decodedToken._id) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id.toString()
    );

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          'Access token refreshed'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
});

const changeCurrentPassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(400, 'Invalid password');
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'Password changed successfully.'));
  }
);

const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  return res.status(200).json(new ApiResponse(200, req.user, 'User details'));
});

const updateAccountDetails = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
      throw new ApiError(400, 'All fields are required');
    }

    const user = User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullName,
          email,
        },
      },
      { new: true }
    ).select('-password');

    return res
      .status(200)
      .json(new ApiResponse(200, user, 'Account details updated successfully'));
  }
);

const updateUserAvatar = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, 'Avatar image file is missing');
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar?.url) {
      throw new ApiError(400, 'Error while uploading on avatar');
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { avatar: avatar.url } },
      { new: true }
    ).select('-password');

    return res
      .status(200)
      .json(new ApiResponse(200, user, 'Avatar image updated successfully'));
  }
);

const updateUserCoverImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const coverLocalPath = req.file?.path;

    if (!coverLocalPath) {
      throw new ApiError(400, 'Cover image file is missing');
    }
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!coverImage?.url) {
      throw new ApiError(400, 'Error while uploading cover image file');
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { coverImage: coverImage.url } },
      { new: true }
    ).select('-password');

    return res
      .status(200)
      .json(new ApiResponse(200, user, 'Cover image updated successfully'));
  }
);

const getUserChannelProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { username } = req.params;

    if (!username?.trim()) {
      throw new ApiError(400, 'username is missing');
    }

    const channel = await User.aggregate([
      {
        $match: {
          username: username?.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: 'subscription',
          localField: '_id',
          foreignField: 'channel',
          as: 'subscribers',
        },
      },
      {
        $lookup: {
          from: 'subscription',
          localField: '_id',
          foreignField: 'subscriber',
          as: 'subscribedTo',
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: '$subscribers',
          },
          channelsSubscribedToCount: {
            $size: '$subscribedTo',
          },
          isSubscribed: {
            $cond: {
              if: { $in: [req.user?._id, 'subscribers.subscriber'] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          subscribersCount: 1,
          channelsSubscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
        },
      },
    ]);

    if (!channel?.length) {
      throw new ApiError(404, 'channel does not exist');
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, channel[0], 'User channel fetched successfully')
      );
  }
);

const getWatchHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user?._id),
        },
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'watchHistory',
          foreignField: '_id',
          as: 'watchHistory',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      username: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                owner: {
                  $first: '$owner',
                },
              },
            },
          ],
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user[0].watchHistory,
          'Watch history fetched successfully'
        )
      );
  }
);

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
