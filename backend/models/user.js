const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password : { type: String, required: true }
});

userSchema.plugin(uniqueValidator); //validate user unique email before saving them

//collection name: user
module.exports =  mongoose.model('User', userSchema);
