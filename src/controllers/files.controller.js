const multer = require('multer');
const jwt = require('jsonwebtoken');
const { auth, authFaculty } = require('../middleware/auth');
const FileManager = require('../services/fileManager');
const { upvoteFile, downvoteFile, removeUpvote, removeDownvote } = require('../models/rating');
const logger = require('../utils/logger');

const fileManager = FileManager.getInstance();

async function getFacultyAcademicSchema(req, res) {
  try {
    const acadmicsSchema = await fileManager.listFolders();
    res.json(acadmicsSchema);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
}

async function getAcademicsSemList(req, res) {
  try {
    const acadmicsSemList = await fileManager.getSemList();
    res.json(acadmicsSemList);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
}

async function getFacultyList(req, res) {
  try {
    const facultyList = await fileManager.getScheduleOrFaculty('faculty');
    res.json(facultyList);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
}

async function getScheduleList(req, res) {
  try {
    const scheduleList = await fileManager.getScheduleOrFaculty('schedule');
    res.json(scheduleList);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
}

async function getPyqs(req, res) {
  try {
    const token = req.cookies.itrbauth;
    const verifyUser = jwt.verify(token, process.env.SECRET);
    const userId = verifyUser.username;
    const PYQs = await fileManager.getPYQs(req.query.sem, userId);
    return res.status(201).json(PYQs);
  } catch (error) {
    logger.error(error.message);
  }
}

async function getSubFiles(req, res) {
  try {
    const token = req.cookies.itrbauth;
    const verifyUser = jwt.verify(token, process.env.SECRET);
    const userId = verifyUser.username;
    const Files = await fileManager.getSubjectFiles(req.query.subject, req.query.type, userId);
    return res.status(201).json(Files);
  } catch (error) {
    logger.error(error.message);
  }
}

async function getDownloadFile(req, res) {
  try {
    const fileId = req.query.fileId;
    await fileManager.downloadFileStream(fileId, res);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send('Error downloading file');
  }
}

async function postFacultyUpload(req, res) {
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
}

async function deleteFacultyDeleteFile(req, res) {
  try {
    const fileId = req.body.fileToBeDeleted;
    const token = req.cookies.itrbauth;
    const verifyUser = jwt.verify(token, process.env.SECRET);
    const userId = verifyUser.username;
    await fileManager.deleteFile(fileId);
    logger.info(`File deleted by '${userId}' having ID = '${fileId}'`);
    res.sendStatus(200);
  } catch (err) {
    logger.error(err.message);
    res.sendStatus(504);
  }
}

async function postGetFilesMetadata(req, res) {
  try {
    const files = await fileManager.getListFilesMetadata(req.body);
    res.status(200).json(files);
  } catch (err) {
    logger.error(err.message);
    res.status(500).render('500');
  }
}

async function postFileUpvote(req, res) {
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
}

async function postFileDownvote(req, res) {
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
}

async function postFileRemoveUpvote(req, res) {
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
}

async function postFileRemoveDownvote(req, res) {
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
}

module.exports = {
  getFacultyAcademicSchema,
  getAcademicsSemList,
  getFacultyList,
  getScheduleList,
  getPyqs,
  getSubFiles,
  getDownloadFile,
  postFacultyUpload,
  deleteFacultyDeleteFile,
  postGetFilesMetadata,
  postFileUpvote,
  postFileDownvote,
  postFileRemoveUpvote,
  postFileRemoveDownvote,
};
