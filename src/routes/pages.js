const express = require('express');
const jwt = require('jsonwebtoken');
const { auth, authFaculty } = require('../middleware/auth');
const FileManager = require('../services/fileManager');
const register = require('../models/register');
const logger = require('../utils/logger');

const router = express.Router();
const fileManager = FileManager.getInstance();

const SUPPORT_MAIL = process.env.SUPPORT_MAIL || 'resourcebank.it@nitj.ac.in';

router.get('/', auth, async (req, res) => {
  try {
    res.status(200).render('index');
  } catch (error) {
    logger.error(error.message);
  }
});

router.get('/home', auth, async (req, res) => {
  try {
    res.status(200).render('index');
  } catch (error) {
    logger.error(error.message);
  }
});

router.get('/faculty', authFaculty, async (req, res) => {
  try {
    res.status(201).render('faculty');
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
  }
});

router.get('/curriculum', auth, (req, res) => {
  try {
    res.render('curriculum');
  } catch (error) {
    logger.error(error.message);
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

router.get('/dsa', auth, (req, res) => {
  try {
    res.render('dsa');
  } catch (error) {
    logger.error(error.message);
  }
});
router.get('/os', auth, (req, res) => {
  try {
    res.render('os');
  } catch (error) {
    logger.error(error.message);
  }
});
router.get('/oops', auth, (req, res) => {
  try {
    res.render('oops');
  } catch (error) {
    logger.error(error.message);
  }
});
router.get('/webd', auth, (req, res) => {
  try {
    res.render('webd');
  } catch (error) {
    logger.error(error.message);
  }
});
router.get('/dbms', auth, (req, res) => {
  try {
    res.render('dbms');
  } catch (error) {
    logger.error(error.message);
  }
});
router.get('/cn', auth, (req, res) => {
  try {
    res.render('cn');
  } catch (error) {
    logger.error(error.message);
  }
});
router.get('/placement', auth, (req, res) => {
  try {
    res.render('placement');
  } catch (error) {
    logger.error(error.message);
  }
});
router.get('/support', auth, (req, res) => {
  try {
    res.render('feedback');
  } catch (error) {
    logger.error(error.message);
  }
});
router.get('/team', auth, (req, res) => {
  try {
    res.render('team');
  } catch (error) {
    logger.error(error.message);
  }
});

router.get('/terms', (req, res) => {
  try {
    res.render('terms');
  } catch (error) {
    logger.error(error.message);
  }
});

router.get('/privacy', (req, res) => {
  try {
    res.render('privacy');
  } catch (error) {
    logger.error(error.message);
  }
});

// Support form submission
router.post('/support', auth, async (req, res) => {
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
});

module.exports = router;
