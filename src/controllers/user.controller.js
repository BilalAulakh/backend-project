import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import nodemailer from "nodemailer";
// import {sendEmail} from '../utils/sendEmail.js'
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {Product} from "../models/product.model.js";
import mongoose from "mongoose";

dotenv.config({
  path: './env',
});

// export const createSecretToken = (payload) => {
//   return jwt.sign(payload, process.env.SECRET_KEY, {
//     expiresIn: "24h",
//   });
// };
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const acessToken = user.generateAccessToken();

    console.log("access token", acessToken);
    const refreshToken = user.generateRefreshToken();
    console.log("refressh token ", refreshToken);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { acessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and accesstoken"
    );
  }
};
// generateAccessAndRefreshToken()
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User email and username already exist");
  }
  // console.log("avatar and coverImage", req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;

  console.log('avatarLocalPath',avatarLocalPath)
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log('avatar files is',avatarLocalPath)
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }
  // const user=User.findOne({email})

 
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Somthing went wrong while register the user");
  }
  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Username and email is required");
  }

  const user = await User.findOne({
    // email,
    // user both username ky liy ya email
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credential");
  }
  
  const { acessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // console.log("access token", acessToken);
  // console.log("refresh token", refreshToken);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const mailSend = await sendEmail({
    email: email,
    subject: "OTP for login",
    text: `Your OTP for login is `,
    html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>

            <style>

    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500&display=swap');

    /* Default styles outside of media query */


    /* Media query for screen width up to 768px */
    @media screen and (max-width: 800px) {
      .para-makely1{
        font-size: 0.625rem !important;
        line-height: 19px !important;

      }
      .para-makely{
        font-size: 0.625rem !important;


      }
      .hole-container{
        padding-left: 0px !important;
        padding-right: 8px !important;
      }
      body{
        background-color: white !important;
        padding-top:10px !important;
        padding-bottom:10px !important;
        padding-right:20px !important;
        padding-left:20px !important;
      }
      .card-wdth{
        max-width: 400px !important;

      }
    }
  </style>
          </head>
          <body style="background-color: #E3E3E3;padding-top:30px;padding-bottom:30px;padding-right:15px;padding-left:15px;">

              <div class="card-wdth" style="background-color: white !important; max-width: 550px; height: auto;padding: 15px; margin:auto;" >
                <div style="text-align: center;margin-top: 10px; padding-top: 20px;"> <img src="https://makely.bixosoft.com/_next/static/media/makely.b4c87dfe.png"  width="160px" height="auto" alt="Description of the image">
                </div>
            <div><p style="text-align: center;font-weight: 500;font-size: 26px;font-family: 'Poppins', sans-serif;font-size: 18px;color: #000000;">Let’s Sign You In  </p></div>
            <div class="hole-container" style="padding-left: 35px;padding-right:35px;font-family: 'Poppins',sans-serif;font-weight: 400;"> 
            <div style="color: #303030;font-size: 14px;font-family: 'Poppins', sans-serif;padding-top:13px;"><p>Dear User,</p></div>

        <div><p class="para-makely" style="color: #303030;font-size: 14px;font-family: 'Poppins', sans-serif;padding-top:13px;">Thank you for choosing MAKELY PRO. Use This One Time Passcode (OTP) to complete your Sign Up Procedure & Verify Your Accont on MAKELY PRO.</p></div>
        <div style="height: 70px;background-color: rgb(206, 246, 232);border: none;outline: none;width: 100%;letter-spacing: 10px;font-size: 40px;font-weight: 600;display:flex;justify-content:center;align-items: center;padding:5px;margin-top:15px">
        <span style="font-size:30px;margin:auto">768896</span>
          <!-- <input type="tel" id="otp" name="otp" maxlength="6" style="border: none;outline: none;text-align: center;height: 70px;background-color: rgb(206, 246, 232);width: 100%;letter-spacing: 10px;font-size: 40px;font-weight: 600;" > -->
        </div>
        <div class="para-makely" style="padding-top: 13px; color: #303030;font-size: 14px;font-family: 'Poppins', sans-serif"><p>This OTP is Valid For 05 Mins</p></div>
        <div ><p class="para-makely" style="color: #FF5151;font-size: 14px;font-family: 'Poppins', sans-serif;">“Please Don't Share Your OTP With Anyone For Your Account <br> Security.”</p></div>

        <p class="para-makely" style="color: #303030 ;font-size: 14px;font-weight: 600;font-size: 18px;font-family: 'Poppins', sans-serif;padding-top:12px">Thank You</p>
        </div>

            </div>

            </body>


        </html>
        `,
  });

  if (!mailSend) {
    return res.status(400).json({
      status: "error",
      message: "Error in sending email",
    });
  }
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", acessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          acessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);

  return res.status(200).json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { acessToken, newRefreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    return res
      .status(200)
      .cookie("accessToken", acessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { acessToken, refreshToken: newRefreshToken },
          "Acess Tokens Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Passwod changed successfully"));
});






const getCurrentUser = asyncHandler(async (req, res) => {

  

const user=req.user
  // const user=User.findById(req.user?._id)
  console.log('user is',user)

  return res.status(200).json(new ApiResponse(200,{user},"get current user successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
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
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Detail Updated Successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatar = await uploadCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password")
 
  return res.status(200).json(new ApiResponse(200,user,"Avatar updated successfully"))
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

const user=  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password")
  return res.status(200).json(new ApiResponse(200,user,"Cover Image updated successfully"))
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};
