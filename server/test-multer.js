require('dotenv').config();
const express = require('express');
const { upload } = require('./config/cloudinary');

const app = express();
app.post('/test-upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send("No file");
  res.json({ url: req.file.path });
});
app.use((err, req, res, next) => {
  console.error("MULTER ERROR:", err);
  res.status(500).send(err.message);
});
app.listen(5001, () => console.log('Test server on 5001'));
