const expres = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { createUser, userLogin } = require('../controllers/user');

const User = require('../models/user');

const router = expres.Router();

//SIGNUP route
router.post('/signup', createUser);

//LOGIN route
router.post('/login', userLogin);

module.exports = router;
