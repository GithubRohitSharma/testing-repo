const express = require("express");
const app = express();
const methodOverride = require('method-override');
const path = require("path");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
const logger = require('./utils/logger');
const env = require('./config/env');

// Core middleware
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static & views
const staticPath = path.join(__dirname, "../public");
app.use(express.static(staticPath));
app.set('view engine', "hbs");
app.set('views', path.join(__dirname, 'views'));

// Partials
const partialPath = path.join(__dirname, 'views/partials');
hbs.registerPartials(partialPath);

// DB
require("./config/db");

// Routers
const authRouter = require('./routes/auth');
const pagesRouter = require('./routes/pages');
const adminRouter = require('./routes/admin');
const filesRouter = require('./routes/files');

app.use(authRouter);
app.use(pagesRouter);
app.use(adminRouter);
app.use(filesRouter);

// 404 fallbacks
app.get("*", (req, res) => {
  try {
    res.render("404.hbs");
  } catch (error) {
    logger.error(error.message);
  }
});

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log("Listening to port " + PORT);
});
