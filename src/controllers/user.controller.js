import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinaryService.js';

const registerUser = asyncHandler(async (req, res) => {
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
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (req.files?.coverImage) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is required');
  }
  // upload those images to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

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

export { registerUser };
