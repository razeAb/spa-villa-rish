const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const ImageKit = require("imagekit");
const auth = require("../utils/authMiddleware");

const router = express.Router();

const ALLOWED_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME[file.mimetype]) {
      return cb(new Error("Unsupported image type. Use JPEG, PNG, or WebP."));
    }
    cb(null, true);
  },
});

let imagekit = null;
const getImageKit = () => {
  if (imagekit) return imagekit;
  const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;
  if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    return null;
  }
  imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
  });
  return imagekit;
};

router.post("/", auth, (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const client = getImageKit();
    if (!client) {
      console.error("ImageKit is not configured (missing IMAGEKIT_* env vars)");
      return res.status(500).json({ error: "Image storage is not configured" });
    }

    try {
      const ext = ALLOWED_MIME[req.file.mimetype] || "jpg";
      const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
      const result = await client.upload({
        file: req.file.buffer,
        fileName,
        folder: "/spa-villa-rish/packages",
        useUniqueFileName: false,
      });
      res.status(201).json({ url: result.url, fileId: result.fileId });
    } catch (uploadErr) {
      console.error(uploadErr);
      res.status(502).json({ error: "Failed to upload image" });
    }
  });
});

module.exports = router;
