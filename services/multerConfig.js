const multer = require('multer');
const path = require('path');

const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../tempUploads'); // Temporary storage
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/octet-stream'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files and PDFs are allowed!'), false);
  }
};

const upload = multer({ storage: tempStorage, fileFilter });

module.exports = upload;

// const multer = require("multer");
// const path = require("path");
// const crypto = require("crypto");
// const fs = require("fs");

// // Encrypt file before saving it
// const encryptFile = (filePath) => {
//   const cipher = crypto.createCipher("aes-256-ctr", "encryptionKey");
//   const input = fs.createReadStream(filePath);
//   const output = fs.createWriteStream(`${filePath}.enc`);

//   input.pipe(cipher).pipe(output);

//   output.on("finish", () => {
//     fs.unlinkSync(filePath); // Delete the original unencrypted file
//   });

//   return `${filePath}.enc`;
// };

// const tempStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadPath = path.join(__dirname, "../tempUploads");
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, `${uniqueSuffix}-${file.originalname}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedMimeTypes = [
//     "image/jpeg",
//     "image/png",
//     "image/gif",
//     "application/pdf",
//     "application/octet-stream",
//   ];
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files and PDFs are allowed!"), false);
//   }
// };

// const upload = multer({
//   storage: tempStorage,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10 MB
// }).single("file");

// module.exports = (req, res, next) => {
//   upload(req, res, function (err) {
//     if (err instanceof multer.MulterError) {
//       return res.status(400).send({ error: err.message });
//     } else if (err) {
//       return res.status(400).send({ error: err.message });
//     }

//     const encryptedFilePath = encryptFile(req.file.path);

//     req.file.path = encryptedFilePath;
//     req.file.encrypted = true;

//     next();
//   });
// };
