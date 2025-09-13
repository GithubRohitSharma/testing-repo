const express = require('express');
const { getLogin, getChangePassword, getSignup, postLogin, postChangePassword, postSignup, postHome } = require('../controllers/auth.controller');

const router = express.Router();

router.get('/login', getLogin);
router.get('/changePassword', getChangePassword);
router.get('/signup', getSignup);

router.post('/login', postLogin);
router.post('/changePassword', postChangePassword);
router.post('/signup', postSignup);
router.post('/home', postHome);

module.exports = router;
