const express = require('express');
const multer = require('multer');
const { auth, authFaculty } = require('../middleware/auth');
const files = require('../controllers/files.controller');

const router = express.Router();
const upload = multer();

router.get('/faculty/academic_schema', authFaculty, files.getFacultyAcademicSchema);
router.get('/get-academics-sem-list', auth, files.getAcademicsSemList);
router.get('/get-faculty-list', auth, files.getFacultyList);
router.get('/get-schedule-list', auth, files.getScheduleList);
router.get('/get-pyqs', auth, files.getPyqs);
router.get('/get-subFiles', auth, files.getSubFiles);
router.get('/downloadFile', files.getDownloadFile);

router.post('/faculty/upload', authFaculty, upload.single('fileInput'), files.postFacultyUpload);
router.delete('/faculty/delete-file', authFaculty, files.deleteFacultyDeleteFile);
router.post('/get-files-metadata', auth, files.postGetFilesMetadata);

router.post('/file/upvote', auth, files.postFileUpvote);
router.post('/file/downvote', auth, files.postFileDownvote);
router.post('/file/remove-upvote', auth, files.postFileRemoveUpvote);
router.post('/file/remove-downvote', auth, files.postFileRemoveDownvote);

module.exports = router;
