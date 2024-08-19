const express = require('express');
const router = express.Router();
const upload = require('../services/multerConfig');
const uploadMedicalRecords = require("../services/medicalRecordsMulter")
const fileController = require("../controllers/fileController")

const {
  requestPermission,
  respondToPermissionRequest,
  uploadFile,
  revokeFileAccess,
  listSharedFiles
} = require('../controllers/fileController');



router.post('/request-permission', fileController.requestPermission);
router.post('/respond-permission', respondToPermissionRequest);
router.post('/upload-file', uploadMedicalRecords.single('file'), uploadFile);
router.post('/revoke-file', revokeFileAccess);
router.get('/shared-files', listSharedFiles);

module.exports = router;