const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");
const Image = require("../models/Image");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const uploadImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "File is required. Please upload an image",
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const { publicId, url } = await uploadToCloudinary(file.path);

      const newlyUploadedImage = new Image({
        url,
        publicId,
        uploadedBy: req.userInfo.userId,
      });

      await newlyUploadedImage.save();

      uploadedImages.push(newlyUploadedImage);

      // delete the file from local storage
      fs.unlinkSync(file.path);
    }

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: uploadedImages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while uploading image",
    });
  }
};

// Fetch Images
const fetchImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const totalImages = await Image.countDocuments();

    const totalPages = Math.ceil(totalImages / limit);

    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const images = await Image.find().sort(sortObj).skip(skip).limit(limit);
    if (images) {
      res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: totalPages,
        totalImages: totalImages,
        data: images,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No images found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while fetching images",
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const imageId = req.params.id;
    const userId = req.userInfo.userId;

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found!",
      });
    }

    if (image.uploadedBy.toString() !== userId) {
      return res.staus(403).json({
        success: false,
        message: "You are not authorized to delete this image.",
      });
    }

    // delete image from your cloudinary storage
    await cloudinary.uploader.destroy(image.publicId);

    // delete image from mongodb database
    await Image.findByIdAndDelete(imageId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while deleting image",
    });
  }
};

module.exports = { uploadImage, fetchImages, deleteImage };
