import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { getMe } from './controllers/auth.js';
import mongoose from 'mongoose';
import Student from './models/Student.js';
import Alumni from './models/Alumni.js';

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const student = await Student.findOne({});
  if (student) {
    const req = { user: { _id: student._id } };
    const res = {
      status: (code) => ({
        json: (data) => console.log('STATUS:', code, 'DATA:', data)
      }),
      json: (data) => console.log('SUCCESS:', data)
    };
    await getMe(req, res);
  } else {
    console.log("No student found");
  }
  
  const alumni = await Alumni.findOne({});
  if (alumni) {
    const req = { user: { _id: alumni._id } };
    const res = {
      status: (code) => ({
        json: (data) => console.log('STATUS:', code, 'DATA:', data)
      }),
      json: (data) => console.log('SUCCESS:', data)
    };
    await getMe(req, res);
  }
  
  process.exit();
}
test();
