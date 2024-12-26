const multer = require('multer');
const path = require('path');

// Configure storage location and file naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use "uploads/" or any other folder (ensure it exists)
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // e.g. "assignment-<timestamp>.<ext>"
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now();
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// Export a single-file upload middleware
exports.uploadSingleFile = upload.single('assignmentFile');