const expres = require('express');
const multer = require('multer');

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const router = expres.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}

//File storaging options
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // return null/undefined if we dont find the mime type
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }

    callback(error, 'backend/images'); //path relative to server.js
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    callback(null, name + '-' + Date.now() + '.' + ext); //unique filename creation
  }
});

//POST method
router.post(
  '',
  checkAuth,
  multer({storage: storage}).single("image"), //extract file
  (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename
  });
  post.save().then(createdPost => {  //save the data into the db
    res.status(201).json({
      message: 'Post added succesfully',
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  });
});

//PATCH method
router.patch(
  ("/:id"),
  checkAuth,
  multer({storage: storage}).single("image"),
  (req, res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + "/images/" + req.file.filename
  }

  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });

  Post.updateOne({_id: req.params.id}, post).then(() => {
    res.status(200).json({
      message: "Post updated successful"
    });
  })
});

//GET method
router.get('', (req, res, next) => {
  const pageSize = +req.query.pagesize; // +: to convert string to number
  const currentPage = +req.query.page;
  const postQuery = Post.find(); //Post.find() return all entries

  let fetechedPosts;

  if (pageSize && currentPage) {
    postQuery //** Still cycle all the entries **//
    .skip(pageSize * (currentPage - 1)) //skip the total element depending on the selected page
    .limit(pageSize); //return the number of element selected
  }

  postQuery
  .then(documents => { //async
    fetechedPosts = documents;
    return Post.estimatedDocumentCount(); //return the number of result
  })
  .then(count => {
    res.status(200).json({
      message: 'Posts fetched succesfully!',
      posts: fetechedPosts,
      maxPosts: count
    });
  });
});

//GET method single post
router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id)
  .then(post => {
    if (post) {
      res.status(200).json({
        message: 'Post fetched succesfully!',
        post: post
      });
    } else {
       res.status(404).json({message: 'Post not found'});
    }
  });
});

//DELETE method
router.delete('/:id', checkAuth, (req, res, next) => {
  Post.deleteOne({_id: req.params.id}).then(() => {
    res.status(200).json({
      message: "Post deleted"
    });
  });
});

module.exports = router;
