const PermissionRequest = require("../models/filePermissionSchema");
const File = require("../models/fileSchema");
const Notification = require("../models/notificationSchema");
function moveToPermanentStorage(tempPath, fileField) {
    let permanentBasePath = path.join(__dirname, "../uploads");
    switch (fileField) {
      case "profilePicture":
        permanentBasePath = path.join(permanentBasePath, "profilePictures");
        break;
      case "doc":
        permanentBasePath = path.join(permanentBasePath, "educationDoc");
        break;
      // case 'achievementDocuments':
      //   permanentBasePath = path.join(permanentBasePath, 'achievementDocs');
      //   break;
      default:
        permanentBasePath = path.join(permanentBasePath, "otherDocs");
        break;
    }
  
    const permanentPath = path.join(permanentBasePath, path.basename(tempPath));
  
    // Ensure the directory exists
    if (!fs.existsSync(permanentBasePath)) {
      fs.mkdirSync(permanentBasePath, { recursive: true });
    }
  
    // Move the file to the permanent path
    fs.renameSync(tempPath, permanentPath);
  
    return permanentPath;
  }
  
exports.requestPermission = async (req, res) => {
  try {
    const { doctorId } = req.body;
    req.user = {
        _id: "66be32ba84349240bd37773d", 
      };
    const existingRequest = await PermissionRequest.findOne({
      patient: req.user._id,
      doctor: doctorId,
    });
    if (existingRequest) {
      return res.status(400).json({
        message: "You have already requested permission from this doctor.",
      });
    }

    const permissionRequest = new PermissionRequest({
      patient: req.user._id,
      doctor: doctorId,
    });

    await permissionRequest.save();

    res.status(200).json({ message: "Permission request sent successfully." });
  } catch (error) {
    console.log("here here!")
    res.status(500).json({ error: error.message });
  }
};

exports.respondToPermissionRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    console.log("req id: " + requestId)
    req.user = {
        _id: "66ba3669c979e84f2122d38e", 
      };

    const permissionRequest = await PermissionRequest.findById(requestId);
    if (!permissionRequest) {
      return res.status(404).json({ message: "Permission request not found." });
    }

    if (permissionRequest.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to respond to this request.",
      });
    }

    permissionRequest.status = action === "approve" ? "approved" : "rejected";
    permissionRequest.respondedAt = Date.now();

    await permissionRequest.save();

    res
      .status(200)
      .json({ message: `Permission request ${action}d successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// file sharing function :

exports.uploadFile = async (req, res) => {
  try {
    const { doctorId } = req.body;
    req.user = {
        _id: "66be32ba84349240bd37773d", 
      };
    const permissionRequest = await PermissionRequest.findOne({
      patient: req.user._id,
      doctor: doctorId,
      status: "approved",
    });
    if (!permissionRequest) {
      return res.status(403).json({
        message: "You do not have permission to share files with this doctor.",
      });
    }

    const newFile = new File({
      filename: req.file.filename,
      filePath: req.file.path,
      uploadedBy: req.user._id,
      sharedWith: doctorId,
      encrypted: req.file.encrypted,
    });

    await newFile.save();

    const notification = new Notification({
      recipient: doctorId,
      type: "fileShared",
      message: `New file shared by ${req.user.username}`,
    });

    await notification.save();

    res.status(200).json({ message: "File uploaded and shared successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//revoke file access

exports.revokeFileAccess = async (req, res) => {
  try {
    const { fileId } = req.body;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to revoke access to this file.",
        });
    }

    file.revoked = true;
    await file.save();

    res.status(200).json({ message: "File access revoked successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//list shared files : 
exports.listSharedFiles = async (req, res) => {
    try {
      const files = await File.find({ sharedWith: req.user._id, revoked: false });
  
      res.status(200).json(files);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };