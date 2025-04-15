const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const uploadMiddleware = require("../middleware/upload-middleware");
const {
  uploadImage,
  fetchImages,
  deleteImage,
} = require("../controllers/image-controller");

router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.array("image", 5),
  uploadImage
);

router.get("/get", authMiddleware, fetchImages);

router.delete("/:id", authMiddleware, adminMiddleware, deleteImage);

module.exports = router;
