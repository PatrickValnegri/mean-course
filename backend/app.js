const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use((req, res, next) => { //use a middleware
  //handle CORS ERROR
  res.setHeader('Access-Control-Allow-Origin', '*'); // * = every domain
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-type, Accept'
  );
  res.setHeader(
    'Access-Controll-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );

  next(); //concatenate middlewares
});

app.use(bodyParser.json()); //return a valid express middleware to parse json data
app.use(bodyParser.urlencoded({extended: false})); //parse url encoded data

app.post('/api/posts', (req, res, next) => {
  const post = req.body;
  console.log(post);
  res.status(201).json({
    message: 'Post added succesfully'
  });
});

//path to handle request on path /api/posts
app.get('/api/posts', (req, res, next) => {
  const posts = [
    {
      id: '1',
      title: 'Fits post',
      content: 'This is coming from the server'
    },
    {
      id: '2',
      title: 'Second post',
      content: 'This is coming also from the server'
    }
  ];

  res.status(200).json({
    message: 'Posts fetched succesfully!',
    posts: posts
  });
});

module.exports = app;
