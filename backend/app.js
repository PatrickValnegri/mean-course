const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes  = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

//DB connection
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb+srv://patrick:RnVNjhlEnCEQdl38@cluster0-8yj3c.mongodb.net/node-angular?retryWrites=true&w=majority").then(() => {
  console.log('connected to database');
})
.catch(() => {
  console.log('connection failed to database');
});

//JSON PARSER
app.use(bodyParser.json()); //return a valid express middleware to parse json data
app.use(bodyParser.urlencoded({extended: false})); //parse url encoded data
app.use("/images", express.static(path.join('backend/images'))); //grant access to folder images

//CORS ERROR
app.use((req, res, next) => { //use a middleware
  res.setHeader('Access-Control-Allow-Origin', '*'); // * = every domain
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );

  next(); //to concatenate middlewares
});

//routes definitions
app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

module.exports = app;
