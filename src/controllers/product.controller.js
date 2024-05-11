import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const productCreate = asyncHandler(async (req, res) => {
  const { productName, productPrice, postDate } = req.body;

  if ([productName, productPrice].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.imageFile) &&
    req.files.imageFile.length > 0
  ) {
    coverImageLocalPath = req.files.imageFile.map((file) => file.path);
  }
  console.log(coverImageLocalPath);

  // const cloudinaryUrls = await Promise.all(
  //   coverImageLocalPath.map(async (localPath) => {
  //     try {
  //       const imageUrl = await uploadCloudinary(localPath);
  //       return imageUrl;
  //     } catch (error) {
  //       console.error("Error uploading image to Cloudinary:", error);
  //       return null;
  //     }
  //   })
  // );

  // const urls = cloudinaryUrls.map((url) => url.url);

  // if (!urls) {
  //   throw new ApiError(400, "Some images failed to upload to Cloudinary");
  // }
  // console.log("urls are", urls);

  const userId = await User.findById(req.user?._id);
  if (!userId) {
    throw new ApiError(400, "User not found");
  }
  const user = await Product.create({
    productName,
    imageFile: coverImageLocalPath ||'',
    productPrice,
    postDate,
    owner: userId._id,
  });

  res
    .status(201)
    .json(
      new ApiResponse(200, { user }, "Product save success fully successfully")
    );
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // const id = req.params.id;
    const product = await Product.find({});

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const productsWithUserDetails = await Product.aggregate([
      // {
      //   $match: { _id: mongoose.Types.ObjectId(id) },
      // },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          user: {
            $arrayElemAt: ["$user", 0] // Select the first element of the user array
          }
        }
      },
      {
        $project: {
          _id: 1,
          productName: 1,
          productPrice:1,
          // imageFile:[],
          // Include other product fields here
          user: { username: 1, email: 1 } // Include only username and email from user
        }
      }
    ]);

    console.log("Product with user details:", productsWithUserDetails);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { product: productsWithUserDetails },
          "Product retrieved successfully"
        )
      );
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});



// const getAllProducts = asyncHandler(async (req, res) => {
//   try {
//     const id = req.params.id;
//     const products = await Product.findById(id);

//     if (!products || products.length === 0) {
//       throw new ApiError(404, 'No products found');
//     }
//     const productss = await Product.aggregate([
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'owner',
//           foreignField: '_id',
//           as: 'user',
//         },
//       },
//     ]);

// console.log('products are ',productss)
//     res.status(200).json(new ApiResponse(200, { products }, 'Products retrieved successfully'));
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     res.status(error.statusCode || 500).json({ message: error.message }); // Handle errors gracefully
//   }
// });
export { productCreate, getAllProducts };
