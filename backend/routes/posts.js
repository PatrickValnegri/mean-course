const expres = require('express');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');
const {
  createPost,
  updatePost,
  fetchPosts,
  fetchPost,
  deletePost
} = require('../controllers/posts');

const router = expres.Router();

//POST route
router.post(
  '',
  checkAuth, //token verification
  extractFile, //extract file
  createPost
);

//PATCH route
router.patch(
  '/:id',
  checkAuth,
  extractFile,
  updatePost
);

//GET route
router.get(
  '',
  fetchPosts
);

//GET route single post
router.get(
  '/:id',
  fetchPost
);

//DELETE route
router.delete(
  '/:id',
  checkAuth,
  deletePost
);

module.exports = router;
