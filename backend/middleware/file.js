const multer = require('multer');

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

module.exports = multer({storage: storage}).single("image");
