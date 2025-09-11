require('dotenv').config();

const env = {
  PORT: process.env.PORT || 8000,
  MONGODB_URI: process.env.MONGODB_URI,
  SECRET: process.env.SECRET,
  SUPPORT_MAIL: process.env.SUPPORT_MAIL || 'resourcebank.it@nitj.ac.in',
  FORGOTPASS: process.env.FORGOTPASS,
  CLIENT_EMAIL: process.env.CLIENT_EMAIL,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  PARENT: process.env.PARENT,
  SCHEDULE: process.env.SCHEDULE,
  ACADEMICS: process.env.ACADEMICS,
  FACULTY: process.env.FACULTY
};

module.exports = env;
