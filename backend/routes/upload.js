const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Configure multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// POST /api/upload - Upload single file
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await uploadToCloudinary(req.file);
    
    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// POST /api/upload/multiple - Upload multiple files
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const results = [];
    
    for (const file of req.files) {
      try {
        const result = await uploadToCloudinary(file);
        results.push({
          url: result.secure_url,
          publicId: result.public_id,
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        });
      } catch (uploadError) {
        console.error('Individual file upload error:', uploadError);
        results.push({
          filename: file.originalname,
          error: 'Upload failed'
        });
      }
    }

    res.json({ files: results });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;