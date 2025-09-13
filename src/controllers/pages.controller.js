const jwt = require('jsonwebtoken');
const { auth, authFaculty } = require('../middleware/auth');
const FileManager = require('../services/fileManager');
const register = require('../models/register');
const logger = require('../utils/logger');

const fileManager = FileManager.getInstance();
const SUPPORT_MAIL = process.env.SUPPORT_MAIL || 'resourcebank.it@nitj.ac.in';

async function getIndex(req, res) {
  try {
    res.status(200).render('index');
  } catch (error) {
    logger.error(error.message);
  }
}
async function getHome(req, res) {
  try {
    res.status(200).render('index');
  } catch (error) {
    logger.error(error.message);
  }
}
async function getFaculty(req, res) {
  try {
    res.status(201).render('faculty');
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
}
function getCurriculum(req, res) {
  try {
    res.render('curriculum');
  } catch (error) {
    logger.error(error.message);
  }
}
async function getSemester(req, res) {
  try {
    const subjects = await fileManager.getSubList(req.query.sem);
    await fileManager.getPYQs(req.query.sem);
    return res.status(201).render('semester', { subjects: JSON.stringify(subjects), semName: req.query.sem });
  } catch (error) {
    logger.error(error.message);
  }
}
async function getSubject(req, res) {
  try {
    return res.status(201).render('subject', { subName: req.query.subjectName, subID: req.query.subjectID });
  } catch (error) {
    logger.error(error.message);
  }
}
function getDsa(req, res) {
  try {
    res.render('dsa');
  } catch (error) {
    logger.error(error.message);
  }
}
function getOs(req, res) {
  try {
    res.render('os');
  } catch (error) {
    logger.error(error.message);
  }
}
function getOops(req, res) {
  try {
    res.render('oops');
  } catch (error) {
    logger.error(error.message);
  }
}
function getWebd(req, res) {
  try {
    res.render('webd');
  } catch (error) {
    logger.error(error.message);
  }
}
function getDbms(req, res) {
  try {
    res.render('dbms');
  } catch (error) {
    logger.error(error.message);
  }
}
function getCn(req, res) {
  try {
    res.render('cn');
  } catch (error) {
    logger.error(error.message);
  }
}
function getPlacement(req, res) {
  try {
    res.render('placement');
  } catch (error) {
    logger.error(error.message);
  }
}
function getSupport(req, res) {
  try {
    res.render('feedback');
  } catch (error) {
    logger.error(error.message);
  }
}
function getTeam(req, res) {
  try {
    res.render('team');
  } catch (error) {
    logger.error(error.message);
  }
}
function getTerms(req, res) {
  try {
    res.render('terms');
  } catch (error) {
    logger.error(error.message);
  }
}
function getPrivacy(req, res) {
  try {
    res.render('privacy');
  } catch (error) {
    logger.error(error.message);
  }
}

async function postSupport(req, res) {
  try {
    await register.sendMail(
      SUPPORT_MAIL,
      SUPPORT_MAIL,
      req.body.subject,
      req.body.name + ' says,\n' + req.body.message + '\n\nSender Mail: ' + req.body.email
    );
    console.log('Feedback sent successfully');
    res.status(201).render('feedback');
  } catch (error) {
    logger.error(error.message);
  }
}

module.exports = {
  getIndex,
  getHome,
  getFaculty,
  getCurriculum,
  getSemester,
  getSubject,
  getDsa,
  getOs,
  getOops,
  getWebd,
  getDbms,
  getCn,
  getPlacement,
  getSupport,
  getTeam,
  getTerms,
  getPrivacy,
  postSupport,
};
