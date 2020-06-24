const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

//SIGNUP handler
exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'User created',
            result: result
          });
        })
        .catch(err => {
          res.status(500).json({
              message: 'Invalid authentication credentials!'
          });
        });
    });
}

//LOGIN + JWT handler
exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if(!user) {
        return res.status(401).json({
          message: 'Authentication failed'
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password)
    })
    .then(result =>{
      if (!result) {
        return res.status(401).json({
          message: 'Authentication failed'
        });
      }

      //CORRECT AUTHENTICATION
      //token creation
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_KEY, //string to encrypt token stored in nodemon.json
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'Authentication succeded',
        token: token,
        expiresIn: 3600, //1h = 3600 seconds
        userId: fetchedUser._id
      });
    })
    .catch(err =>{
      return res.status(401).json({
        message: 'Invalid authentication credentials!'
    });
  });
}
