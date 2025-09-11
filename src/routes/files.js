const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { auth, authFaculty } = require('../middleware/auth');
const FileManager = require('../services/fileManager');
const { upvoteFile, downvoteFile, removeUpvote, removeDownvote } = require('../models/rating');
const logger = require('../utils/logger');

const router = express.Router();
const fileManager = FileManager.getInstance();
const upload = multer();

router.get('/faculty/academic_schema', authFaculty, async (req, res) => {
  try {
    const acadmicsSchema = await fileManager.listFolders();
    res.json(acadmicsSchema);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
});

router.get('/get-academics-sem-list', auth, async (req, res) => {
  try {
    const acadmicsSemList = await fileManager.getSemList();
    res.json(acadmicsSemList);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
});

router.get('/get-faculty-list', auth, async (req, res) => {
  try {
    const facultyList = await fileManager.getScheduleOrFaculty('faculty');
    res.json(facultyList);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
});

router.get('/get-schedule-list', auth, async (req, res) => {
  try {
    const scheduleList = await fileManager.getScheduleOrFaculty('schedule');
    res.json(scheduleList);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
});

router.get('/get-pyqs', auth, (req, res) => {
  try {
    (async function () {
      const token = req.cookies.itrbauth;
      const verifyUser = jwt.verify(token, process.env.SECRET);
      const userId = verifyUser.username;
      const PYQs = await fileManager.getPYQs(req.query.sem, userId);
      return res.status(201).json(PYQs);
    })();
  } catch (error) {
    logger.error(error.message);
  }
});

router.get('/get-subFiles', auth, (req, res) => {
  try {
    (async function () {
      const token = req.cookies.itrbauth;
      const verifyUser = jwt.verify(token, process.env.SECRET);
      const userId = verifyUser.username;
      const Files = await fileManager.getSubjectFiles(req.query.subject, req.query.type, userId);
      return res.status(201).json(Files);
    })();
  } catch (error) {
    logger.error(error.message);
  }
});

router.get('/downloadFile', async (req, res) => {
  try {
    const fileId = req.query.fileId;
    await fileManager.downloadFileStream(fileId, res);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send('Error downloading file');
  }
});

router.get('/semester', auth, async (req, res) => {
  try {
    const subjects = await fileManager.getSubList(req.query.sem);
    await fileManager.getPYQs(req.query.sem);
    return res.status(201).render('semester', { subjects: JSON.stringify(subjects), semName: req.query.sem });
  } catch (error) {
    logger.error(error.message);
  }
});

router.get('/subject', auth, async (req, res) => {
  try {
    return res.status(201).render('subject', { subName: req.query.subjectName, subID: req.query.subjectID });
  } catch (error) {
    logger.error(error.message);
  }
});

router.post('/file/upvote', auth, async (req, res) => {
  try {
    const { fileId } = req.body;
    const token = req.cookies.itrbauth;
    const verifyUser = jwt.verify(token, process.env.SECRET);
    const userId = verifyUser.username;
    await upvoteFile(fileId, userId);
    res.status(200).send('Upvoted successfully');
  } catch (err) {
    logger.error(err.message);
    res.status(500).send(err.message);
  }
});

router.post('/file/downvote', auth, async (req, res) => {
  try {
    const { fileId } = req.body;
    const token = req.cookies.itrbauth;
    const verifyUser = jwt.verify(token, process.env.SECRET);
    const userId = verifyUser.username;
    await downvoteFile(fileId, userId);
    res.status(200).send('Downvoted successfully');
  } catch (err) {
    logger.error(err.message);
    res.status(500).send(err.message);
  }
});

router.post('/file/remove-upvote', auth, async (req, res) => {
  try {
    const { fileId } = req.body;
    const token = req.cookies.itrbauth;
    const verifyUser = jwt.verify(token, process.env.SECRET);
    const userId = verifyUser.username;
    await removeUpvote(fileId, userId);
    res.status(200).send('Upvote removed successfully');
  } catch (err) {
    logger.error(err.message);
    res.status(500).send(err.message);
  }
});

router.post('/file/remove-downvote', auth, async (req, res) => {
  try {
    const { fileId } = req.body;
    const token = req.cookies.itrbauth;
    const verifyUser = jwt.verify(token, process.env.SECRET);
    const userId = verifyUser.username;
    await removeDownvote(fileId, userId);
    res.status(200).send('Downvote removed successfully');
  } catch (err) {
    logger.error(err.message);
    res.status(500).send(err.message);
  }
});

router.post('/faculty/upload', authFaculty, upload.single('fileInput'), async (req, res) => {
  try {
    const { body, file } = req;
    const fileId = await fileManager.uploadToDrive(body, file);
    const token = req.cookies.itrbauth;
    const verifyUser = jwt.verify(token, process.env.SECRET);
    const userId = verifyUser.username;
    logger.info(`File '${req.body.fileName}' added by '${userId}' with ID = '${fileId}'`);
    res.sendStatus(200);
  } catch (err) {
    logger.error(err.message);
    res.sendStatus(504);
  }
});

router.delete('/faculty/delete-file', authFaculty, async (req, res) => {
  try {
    const fileId = req.body.fileToBeDeleted;
    await fileManager.deleteFile(fileId);
    res.sendStatus(200);
  } catch (err) {
    logger.error(err.message);
    res.sendStatus(504);
  }
});

router.post('/get-files-metadata', auth, async (req, res) => {
  try {
    const files = await fileManager.getListFilesMetadata(req.body);
    res.status(200).json(files);
  } catch (err) {
    logger.error(err.message);
    res.status(500).render('500');
  }
});

module.exports = router;
