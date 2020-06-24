const Post = require('../models/post');

//POST handler
exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId //from checkAuth middleware
  });
  post.save().then(createdPost => {  //save the data into the db
    res.status(201).json({
      message: 'Post added succesfully',
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  }).catch(error => { //only thecnical errors
    res.status(500).json({
      message: 'Creating a post failed!'
    });
  });
}


//PATCH handler
exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + "/images/" + req.file.filename
  }

  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });

  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
  .then((result) => {
    if (result.n > 0) { //check if we modify something (log result to see differences)
      res.status(200).json({
        message: "Post updated successful"
      });
    } else {
      res.status(401).json({
        message: "Not authorized"
      });
    }
  }).catch(error => { //only thecnical errors
    res.status(500).json({
      message: 'Updating a post failed!'
    });
  });
}

//GET handler
exports.fetchPosts = (req, res, next) => {
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
  })
  .catch(error => { //only thecnical errors
    res.status(500).json({
      message: 'Fetching posts failed!'
    });
  });
}

//GET single post handler
exports.fetchPost = (req, res, next) => {
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
  })
  .catch(error => { //only thecnical errors
    res.status(500).json({
      message: 'Fetching post failed!'
    });
  });;
}

//DELETE post
exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then((result) => {
    if (result.n > 0) { //check if we delete something
      res.status(200).json({
        message: "Post deleted"
      });
    } else {
      res.status(401).json({
        message: "Not authorized"
      });
    }
  })
  .catch(error => { //only thecnical errors
    res.status(500).json({
      message: 'Deleting post failed!'
    });
  });;
}
