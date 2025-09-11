const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const register = require('../models/register');
const Users = require('../models/user');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');
const env = require('../config/env');

const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  try {
    res.clearCookie('itrbauth');
    res.render('login');
  } catch (error) {
    logger.error(error.message);
  }
});

// Change password page (sends OTP)
router.get('/changePassword', async (req, res) => {
  try {
    let token = jwt.verify(req.cookies.itrbauth, process.env.SECRET);
    let email = token.username;
    Users.findOne({ username: email }).then(async function (val, err) {
      if (val == null) {
        return res.status(201).render('login', { problem: 'UserDNE', username: email });
      } else {
        var otpGen = (Math.floor(100000 + Math.random() * (1000000 - 100000))).toString();
        var otpGenSafe = await bcrypt.hash(otpGen, 10);
        await register
          .sendMail(
            email,
            env.SUPPORT_MAIL,
            'OTP for IT portal',
            'Your OTP to register at IT Portal is: ' + otpGen + '\n\nHave a great time studying!!'
          )
          .then((data) => {
            return res
              .status(201)
              .render('forgot', { username: email, password: process.env.FORGOTPASS, otp: otpGenSafe, registered: '' });
          })
          .catch((err) => {
            logger.error('Failed to send email:\n' + err);
            throw new Error('Failed to send email:\n' + err);
          });
      }
    });
  } catch (error) {
    logger.error(error.message);
  }
});

// Login submit
router.post('/login', async (req, res) => {
  try {
    let email = req.body.mail.toLowerCase();
    let password = req.body.pass;
    if (!(await register.isMailValid(email))) {
      return res.status(201).render('login', { problem: 'InvalidMail', username: '' });
    } else if (!(await register.isPassStrong(password))) {
      return res.status(201).render('login', { problem: 'WeakPassword', username: email });
    } else {
      password = await bcrypt.hash(password, 10);
      Users.findOne({ username: email }).then(async function (val, err) {
        if (val == null) {
          var otpGen = (Math.floor(100000 + Math.random() * (1000000 - 100000))).toString();
          var otpGenSafe = await bcrypt.hash(otpGen, 10);
          var userEncrypted = await bcrypt.hash(email, 10);
          await register
            .sendMail(
              email,
              env.SUPPORT_MAIL,
              'OTP for IT portal',
              'Your OTP to register at IT Portal is: ' + otpGen + '\n\nHave a great time studying!!'
            )
            .then((data) => {
              return res
                .status(201)
                .render('verifyOTP', { username: email, usernameEnc: userEncrypted, password: password, otp: otpGenSafe, registered: 'No' });
            })
            .catch((err) => {
              logger.error('Failed to send email:\n' + err);
              return res.status(201).render('login');
            });
        } else {
          let match = await bcrypt.compare(req.body.pass, val.password);
          var userEncrypted = await bcrypt.hash(email, 10);
          if (match) {
            return res
              .status(200)
              .render('verifyOTP', { username: email, usernameEnc: userEncrypted, password: password, otp: 'Account exists', registered: 'Yes' });
          } else {
            return res.status(201).render('login', { problem: 'InvalidPassword', username: email });
          }
        }
      });
    }
  } catch (error) {
    logger.error(error.message);
  }
});

// Change password submit (send OTP)
router.post('/changePassword', async (req, res) => {
  try {
    let email = req.body.mail.toLowerCase();
    if (!(await register.isMailValid(email))) {
      return res.status(201).render('login', { problem: 'InvalidMail', username: '' });
    } else {
      Users.findOne({ username: email }).then(async function (val, err) {
        if (val == null) {
          return res.status(201).render('login', { problem: 'UserDNE', username: email });
        } else {
          var otpGen = (Math.floor(100000 + Math.random() * (1000000 - 100000))).toString();
          var otpGenSafe = await bcrypt.hash(otpGen, 10);
          var userEncrypted = await bcrypt.hash(email, 10);
          await register
            .sendMail(
              email,
              env.SUPPORT_MAIL,
              'OTP for IT portal',
              'Your OTP to register at IT Portal is: ' + otpGen + '\n\nHave a great time studying!!'
            )
            .then((data) => {
              return res
                .status(201)
                .render('forgot', { username: email, usernameEnc: userEncrypted, password: process.env.FORGOTPASS, otp: otpGenSafe });
            })
            .catch((err) => {
              logger.error('Failed to send email:\n' + err);
            });
        }
      });
    }
  } catch (error) {
    logger.error(error.message);
  }
});

// OTP verification and session creation
router.post('/home', async (req, res) => {
  try {
    let userOTP = req.body.otp,
      otpGen = req.body.otpGen,
      pass = req.body.password,
      user = req.body.username,
      userEnc = req.body.usernameEnc;
    let isAdmin = await register.isAdmin(user);
    if (!(await bcrypt.compare(user, userEnc))) {
      return res.status(201).render('login', { problem: 'Invalid User', username: user });
    }
    if (pass == process.env.FORGOTPASS) {
      let newPass = await bcrypt.hash(req.body.pass, 10);
      if (!(await register.isPassStrong(newPass))) {
        return res.status(201).render('forgot', { problem: 'WeakPassword', username: user, usernameEnc: userEnc, password: pass, otp: otpGen });
      } else if (!(await bcrypt.compare(userOTP, otpGen))) {
        return res.status(201).render('forgot', { problem: 'InvalidOTP', username: user, usernameEnc: userEnc, password: pass, otp: otpGen });
      } else {
        await Users.updateOne({ username: user }, { $set: { password: newPass } }, {});
        const registerUser = await Users.findOne({ username: user });
        const token = await registerUser.generateAuthToken();
        res.cookie('itrbauth', token, {
          expires: new Date(Date.now() + 1300000000),
          httpOnly: true,
        });
        return res.status(200).render('index');
      }
    } else {
      if (userOTP == 'Account exists') {
        const registerUser = await Users.findOne({ username: user });
        const token = await registerUser.generateAuthToken();
        res.cookie('itrbauth', token, {
          expires: new Date(Date.now() + 1300000000),
          httpOnly: true,
        });
        return res.status(200).render('index');
      } else if (!(await bcrypt.compare(userOTP, otpGen))) {
        return res.status(201).render('verifyOTP', { problem: 'InvalidOTP' });
      } else {
        try {
          const registerUser = new Users({ username: user, password: pass, admin: isAdmin, faculty: false });
          const token = await registerUser.generateAuthToken();
          res.cookie('itrbauth', token, {
            expires: new Date(Date.now() + 1300000000),
            httpOnly: true,
          });
          await registerUser.save();
          return res.status(200).render('index');
        } catch (err) {
          throw err;
        }
      }
    }
  } catch (error) {
    logger.error(error.message);
  }
});

module.exports = router;
