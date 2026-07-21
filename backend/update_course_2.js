import 'dotenv/config';
import mongoose from 'mongoose';
import Course from './models/Course.js';

async function updateFirebaseCourse() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const course = await Course.findOne({ title: "Firebase" });
    if (!course) {
      console.log("Course not found");
      process.exit(1);
    }
    
    // Using demo MP4s since they wanted a different platform (Cloudinary) and no youtube.
    course.syllabus = [
      { 
        week: "Lecture 1", topic: "What is Firebase & Setup", 
        video: { url: "https://res.cloudinary.com/demo/video/upload/v1619001362/samples/elephants.mp4", duration: "12:45" } 
      },
      { 
        week: "Lecture 2", topic: "Firebase Authentication", 
        video: { url: "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4", duration: "15:20" } 
      },
      { 
        week: "Lecture 3", topic: "Cloud Firestore Real-time Database", 
        video: { url: "https://res.cloudinary.com/demo/video/upload/dog.mp4", duration: "18:10" } 
      },
      { 
        week: "Lecture 4", topic: "Cloud Storage for Firebase", 
        video: { url: "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4", duration: "14:30" } 
      },
      { 
        week: "Lecture 5", topic: "Cloud Functions", 
        video: { url: "https://res.cloudinary.com/demo/video/upload/dog.mp4", duration: "10:15" } 
      },
      { 
        week: "Lecture 6", topic: "Firebase Hosting & Deployment", 
        video: { url: "https://res.cloudinary.com/demo/video/upload/v1619001362/samples/elephants.mp4", duration: "08:45" } 
      }
    ];
    
    course.reviews = [];
    course.rating = { count: 0, average: 0 };
    
    await course.save();
    console.log("Firebase course updated successfully with Cloudinary mp4s and removed ratings!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateFirebaseCourse();
