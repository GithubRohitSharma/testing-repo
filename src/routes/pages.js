const express = require('express');
const fs = require('fs');
const path = require('path');
const { auth, authAdmin, authFaculty } = require('../middleware/auth');
const { getUsersWithNoPrivileges, getUsersWithPrivileges } = require('../models/manageUserAccess');
const FileManager = require('../services/fileManager');
const logger = require('../utils/logger');

const router = express.Router();
const fileManager = FileManager.getInstance();

router.get('/', auth, async (req, res) => {
  try {
    return res.status(200).render('index');
  } catch (error) {
    logger.error(error.message);
  }
});

router.get('/home', auth, async (req, res) => {
  try {
    return res.status(200).render('index');
  } catch (error) {
    logger.error(error.message);
  }
});

router.get('/admin', authAdmin, async (req, res) => {
  try {
    const allUsers = await getUsersWithNoPrivileges();
    const privilegedUsers = await getUsersWithPrivileges();
    res.status(201).render('admin', { allUsersList: JSON.stringify(allUsers), privilegedUsersList: JSON.stringify(privilegedUsers) });
  } catch (error) {
    logger.error(error.message);
    res.status(500).render('500');
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

router.get('/dsa', auth, (req, res) => { try { res.render('dsa'); } catch (error) { logger.error(error.message); } });
router.get('/os', auth, (req, res) => { try { res.render('os'); } catch (error) { logger.error(error.message); } });
router.get('/oops', auth, (req, res) => { try { res.render('oops'); } catch (error) { logger.error(error.message); } });
router.get('/webd', auth, (req, res) => { try { res.render('webd'); } catch (error) { logger.error(error.message); } });
router.get('/dbms', auth, (req, res) => { try { res.render('dbms'); } catch (error) { logger.error(error.message); } });
router.get('/cn', auth, (req, res) => { try { res.render('cn'); } catch (error) { logger.error(error.message); } });
router.get('/placement', auth, (req, res) => { try { res.render('placement'); } catch (error) { logger.error(error.message); } });
router.get('/support', auth, (req, res) => { try { res.render('feedback'); } catch (error) { logger.error(error.message); } });
router.get('/team', auth, (req, res) => { try { res.render('team'); } catch (error) { logger.error(error.message); } });
router.get('/signup', (req, res) => { try { res.render('signup'); } catch (error) { logger.error(error.message); } });
router.get('/terms', (req, res) => { try { res.render('terms'); } catch (error) { logger.error(error.message); } });
router.get('/privacy', (req, res) => { try { res.render('privacy'); } catch (error) { logger.error(error.message); } });

// Support POST
const register = require('../models/register');
const env = require('../config/env');
router.post('/support', auth, async (req, res) => {
  try {
    await register.sendMail(env.SUPPORT_MAIL, env.SUPPORT_MAIL, req.body.subject, req.body.name + ' says,\n' + req.body.message + '\n\nSender Mail: ' + req.body.email);
    res.status(201).render('feedback');
  } catch (error) {
    logger.error(error.message);
  }
});

module.exports = router;
