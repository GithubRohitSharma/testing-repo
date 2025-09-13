const express = require('express');
const multer = require('multer');
const { authAdmin, authFaculty } = require('../middleware/auth');
const admin = require('../controllers/admin.controller');

const router = express.Router();
const upload = multer();

router.get('/admin', authAdmin, admin.getAdmin);
router.get('/admin/academic_schema', authAdmin, admin.getAcademicSchema);
router.get('/admin/fetch-schedule', authAdmin, admin.getFetchSchedule);
router.get('/admin/fetch-faculty', authAdmin, admin.getFetchFaculty);
router.get('/admin/download-log', authAdmin, admin.getDownloadLog);

router.post('/admin/add-subjects', authAdmin, admin.postAddSubjects);
router.post('/admin/upload-timetable', authFaculty, upload.single('fileInput'), admin.postUploadTimetable);
router.post('/admin/upload-faculty', authFaculty, upload.single('photoInput'), admin.postUploadFaculty);
router.post('/admin/update-faculty/:fileId', authAdmin, upload.single('file'), admin.postUpdateFaculty);

router.put('/admin/rename-directory', authAdmin, admin.putRenameDirectory);
router.put('/admin/remove-privileged-access', authAdmin, admin.putRemovePrivilegedAccess);
router.put('/admin/provide-privileged-access', authAdmin, admin.putProvidePrivilegedAccess);

router.delete('/admin/remove-user', authAdmin, admin.deleteRemoveUser);
router.delete('/admin/delete-directory', authAdmin, admin.deleteDeleteDirectory);

module.exports = router;
