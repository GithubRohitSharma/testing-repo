const mongoose = require('mongoose');
const env = require('./env');

function connectDB() {
  if (!env.MONGODB_URI) {
    console.error('MONGODB_URI is not set');
    return;
  }
  mongoose
    .connect(env.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => console.log('Connection Successfull!'))
    .catch((err) => console.log(err));
}

connectDB();

module.exports = mongoose;
