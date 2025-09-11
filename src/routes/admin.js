const express = require('express');
const fs = require('fs');
const { authAdmin } = require('../middleware/auth');
const FileManager = require('../services/fileManager');
const { getUsersWithNoPrivileges, getUsersWithPrivileges, removeUserById, updateUserModeById } = require('../models/manageUserAccess');
const multer = require('multer');
const logger = require('../utils/logger');

const router = express.Router();
const fileManager = FileManager.getInstance();
const upload = multer();

router.get('/admin/academic_schema', authAdmin, async (req, res) => {
  try {
    const acadmicsSchema = await fileManager.listFolders();
    res.json(acadmicsSchema);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
});

router.get('/admin/fetch-schedule', authAdmin, async (req, res) => {
  try {
    const schedule = await fileManager.listSchedule();
    res.json(schedule);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
});

router.get('/admin/fetch-faculty', authAdmin, async (req, res) => {
  try {
    const faculty = await fileManager.listFaculty();
    res.json(faculty);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
});

router.get('/admin/download-log', authAdmin, (req, res) => {
  try {
    const logFilePath = './logs/app.log';
    if (!fs.existsSync(logFilePath)) {
      return res.status(404).send('File not found.');
    }
    res.setHeader('Content-Type', 'text/plain');
    const stats = fs.statSync(logFilePath);
    res.setHeader('Content-Length', stats.size);
    const readStream = fs.createReadStream(logFilePath);
    readStream.pipe(res);
    readStream.on('error', (err) => {
      res.status(500).send('Error occurred while reading the file.');
    });
  } catch (error) {
    logger.error(error.message);
  }
});

router.post('/admin/add-subjects', authAdmin, async (req, res) => {
  try {
    const fileId = req.body.directoryToBeModified;
    const newName = req.body.newName;
    await fileManager.addSubject(fileId, newName);
    res.sendStatus(200);
  } catch (err) {
    logger.error(err.message);
    res.sendStatus(504);
  }
});

router.post('/admin/upload-timetable', authAdmin, upload.single('fileInput'), async (req, res) => {
  try {
    const { body, file } = req;
    await fileManager.uploadTimetable(body, file);
    res.sendStatus(200);
  } catch (error) {
    logger.error(error.message);
    res.sendStatus(504);
  }
});

router.post('/admin/upload-faculty', authAdmin, upload.single('photoInput'), async (req, res) => {
  try {
    const { body, file } = req;
    await fileManager.uploadFaculty(body, file);
    res.sendStatus(200);
  } catch (error) {
    logger.error(error.message);
    res.sendStatus(504);
  }
});

router.delete('/admin/remove-user', authAdmin, async (req, res) => {
  try {
    const userId = req.body.userToBeRemoved;
    await removeUserById(userId);
    res.redirect('/admin');
  } catch (err) {
    logger.error(err.message);
    res.status(500).render('500');
  }
});

router.delete('/admin/delete-directory', authAdmin, async (req, res) => {
  try {
    const fileId = req.body.directoryToBeDeleted;
    await fileManager.deleteFile(fileId);
    res.sendStatus(200);
  } catch (err) {
    logger.error(err.message);
    res.sendStatus(504);
  }
});

router.put('/admin/remove-privileged-access', authAdmin, async (req, res) => {
  try {
    const userId = req.body.userToRemoveAccess;
    await updateUserModeById(userId, false);
    res.redirect('/admin');
  } catch (err) {
    logger.error(err.message);
    res.status(500).render('500');
  }
});

router.put('/admin/provide-privileged-access', authAdmin, async (req, res) => {
  try {
    const userId = req.body.userToProvideAccess;
    await updateUserModeById(userId, true);
    res.redirect('/admin');
  } catch (err) {
    logger.error(err.message);
    res.status(500).render('500');
  }
});

router.put('/admin/rename-directory', authAdmin, async (req, res) => {
  try {
    const fileId = req.body.directoryToBeModified;
    const newName = req.body.newName;
    await fileManager.renameFile(fileId, newName);
    res.sendStatus(200);
  } catch (err) {
    logger.error(err.message);
    res.sendStatus(504);
  }
});

router.post('/admin/update-faculty/:fileId', authAdmin, upload.single('file'), async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const body = req.body;
    const file = req.file;

    if (!body.facultyName || !body.facultyEmail || !body.facultyRole || !body.facultyContact) {
      return res.status(400).json({ error: 'Missing required fields. Please provide name, email, role and contact.' });
    }

    if (file && !file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed.' });
    }

    const updatedFile = await fileManager.updateFaculty(fileId, body, file);
    return res.status(200).json({ message: 'Faculty updated successfully.', updatedFile });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;
