const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Post = require('./models/post');

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

//CORS ERROR
app.use((req, res, next) => { //use a middleware
  res.setHeader('Access-Control-Allow-Origin', '*'); // * = every domain
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-type, Accept'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );

  next(); //to concatenate middlewares
});

//JSON PARSER
app.use(bodyParser.json()); //return a valid express middleware to parse json data
app.use(bodyParser.urlencoded({extended: false})); //parse url encoded data

//POST method
app.post('/api/posts', (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  post.save().then(createdPost => {  //save the data into the db
    res.status(201).json({
      message: 'Post added succesfully',
      postId: createdPost.id
    });
  });
});

//GET method
app.get('/api/posts', (req, res, next) => {
  Post.find() //return all entries
  .then(documents => { //async
    res.status(200).json({
      message: 'Posts fetched succesfully!',
      posts: documents
    });
  });
});


//DELETE method
app.delete('/api/posts/:id', (req, res, next) => {
  Post.deleteOne({_id: req.params.id}).then(() => {
    res.status(200).json({
      message: "Post deleted"
    });
  });
});

module.exports = app;
