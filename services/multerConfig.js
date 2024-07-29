const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("this is the file: " + file)
    let uploadPath = '../uploads'; 
    
    switch (file.fieldname) {
      case 'profilePicture':
        uploadPath = path.join(__dirname, '../uploads/profilePictures');
        break;
      case 'doc':
        uploadPath = path.join(__dirname, '../uploads/educationDoc');
        break;
      // case 'achievementDocuments':
      //   uploadPath = path.join(__dirname, '../uploads/achievementDocs');
      //   break;
      default:
        uploadPath = path.join(__dirname, '../uploads');
        break;
    }
    
    // Ensure the directory exists
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});


const fileFilter = (req, file, cb) => {
  console.log('looooooooooh')
  console.log("this are files: " + JSON.stringify(file))
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/octet-stream']; 
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files and PDFs are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
