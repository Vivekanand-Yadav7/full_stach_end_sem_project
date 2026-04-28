require('dotenv').config({ path: '/home/vy1456/projects/end_sem_full_stack/server/.env' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.api.ping(function(error, result) {
  if (error) {
    console.error("Cloudinary Ping Error:", error);
  } else {
    console.log("Cloudinary Ping Success:", result);
  }
});
