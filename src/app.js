const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();

// Global middleware
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Views
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
const partialPath = path.join(__dirname, 'views/partials');
hbs.registerPartials(partialPath);

// DB
require('./config/db');

// Routers
const authRoutes = require('./routes/auth');
const pagesRoutes = require('./routes/pages');
const adminRoutes = require('./routes/admin');
const filesRoutes = require('./routes/files');

// Mount (no path prefix to keep existing URLs unchanged)
app.use(authRoutes);
app.use(pagesRoutes);
app.use(adminRoutes);
app.use(filesRoutes);

// 404
app.get('*', (req, res) => {
  try {
    res.render('404.hbs');
  } catch (error) {
    logger.error(error.message);
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log('Listening to port ' + PORT);
});
