const fs = require('fs');
const multer = require('multer');
const FileManager = require('../services/fileManager');
const { getUsersWithNoPrivileges, getUsersWithPrivileges, removeUserById, updateUserModeById } = require('../models/manageUserAccess');
const logger = require('../utils/logger');

const fileManager = FileManager.getInstance();

async function getAdmin(req, res) {
  try {
    const allUsers = await getUsersWithNoPrivileges();
    const privilegedUsers = await getUsersWithPrivileges();
    res.status(201).render('admin', { allUsersList: JSON.stringify(allUsers), privilegedUsersList: JSON.stringify(privilegedUsers) });
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
}

async function getAcademicSchema(req, res) {
  try {
    const acadmicsSchema = await fileManager.listFolders();
    res.json(acadmicsSchema);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
}

async function getFetchSchedule(req, res) {
  try {
    const schedule = await fileManager.listSchedule();
    res.json(schedule);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
}

async function getFetchFaculty(req, res) {
  try {
    const faculty = await fileManager.listFaculty();
    res.json(faculty);
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
}

function getDownloadLog(req, res) {
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

    readStream.on('error', () => {
      res.status(500).send('Error occurred while reading the file.');
    });
  } catch (error) {
    logger.error(error.message);
  }
}

async function postAddSubjects(req, res) {
  try {
    const fileId = req.body.directoryToBeModified;
    const newName = req.body.newName;
    await fileManager.addSubject(fileId, newName);
    res.sendStatus(200);
  } catch (err) {
    logger.error(err.message);
    res.sendStatus(504);
  }
}

async function postUploadTimetable(req, res) {
  try {
    const { body, file } = req;
    await fileManager.uploadTimetable(body, file);
    res.sendStatus(200);
  } catch (error) {
    logger.error(error.message);
    res.sendStatus(504);
  }
}

async function postUploadFaculty(req, res) {
  try {
    const { body, file } = req;
    await fileManager.uploadFaculty(body, file);
    res.sendStatus(200);
  } catch (error) {
    logger.error(error.message);
    res.sendStatus(504);
  }
}

async function putRenameDirectory(req, res) {
  try {
    const fileId = req.body.directoryToBeModified;
    const newName = req.body.newName;
    await fileManager.renameFile(fileId, newName);
    res.sendStatus(200);
  } catch (err) {
    logger.error(err.message);
    res.sendStatus(504);
  }
}

async function putRemovePrivilegedAccess(req, res) {
  try {
    const userId = req.body.userToRemoveAccess;
    await updateUserModeById(userId, false);
    res.redirect('/admin');
  } catch (err) {
    logger.error(err.message);
    res.status(500).render('500');
  }
}

async function putProvidePrivilegedAccess(req, res) {
  try {
    const userId = req.body.userToProvideAccess;
    await updateUserModeById(userId, true);
    res.redirect('/admin');
  } catch (err) {
    logger.error(err.message);
    res.status(500).render('500');
  }
}

async function deleteRemoveUser(req, res) {
  try {
    const userId = req.body.userToBeRemoved;
    await removeUserById(userId);
    res.redirect('/admin');
  } catch (err) {
    logger.error(err.message);
    res.status(500).render('500');
  }
}

async function deleteDeleteDirectory(req, res) {
  try {
    const fileId = req.body.directoryToBeDeleted;
    await fileManager.deleteFile(fileId);
    res.sendStatus(200);
  } catch (err) {
    logger.error(err.message);
    res.sendStatus(504);
  }
}

async function postUpdateFaculty(req, res) {
  try {
    const fileId = req.params.fileId;
    const body = req.body;
    const file = req.file;

    console.log('Received update faculty request for fileId:', fileId);
    console.log('Request body:', body);
    console.log('File uploaded:', file ? file.originalname : 'No file');

    if (!body.facultyName || !body.facultyEmail || !body.facultyRole || !body.facultyContact) {
      return res.status(400).json({ error: 'Missing required fields. Please provide name, email, role and contact.' });
    }

    if (file && !file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed.' });
    }

    const updatedFile = await fileManager.updateFaculty(fileId, body, file);
    console.log('Faculty updated successfully:', updatedFile);

    return res.status(200).json({ message: 'Faculty updated successfully.', updatedFile: updatedFile });
  } catch (error) {
    console.error('Error in update-faculty route:', error);
    logger.error(error.message);
    res.status(500).json({ error: error.message || 'Server error' });
  }
}

module.exports = {
  getAdmin,
  getAcademicSchema,
  getFetchSchedule,
  getFetchFaculty,
  getDownloadLog,
  postAddSubjects,
  postUploadTimetable,
  postUploadFaculty,
  putRenameDirectory,
  putRemovePrivilegedAccess,
  putProvidePrivilegedAccess,
  deleteRemoveUser,
  deleteDeleteDirectory,
  postUpdateFaculty,
};
