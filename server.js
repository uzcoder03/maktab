
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cybershield_db';
const JWT_SECRET = process.env.JWT_SECRET || 'cyber_secret_2025_private_key';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('>>> DATABASE CONNECTED'))
  .catch(err => console.error('>>> DB ERROR:', err.message));

// --- MODELLAR ---
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'TEACHER', 'ACADEMIC', 'STUDENT'], required: true },
  firstName: String, 
  lastName: String, 
  specialization: String,
  assignedGrades: [String],
  grade: String,
  mustChangePassword: { type: Boolean, default: false }
}));

const SchoolClass = mongoose.model('SchoolClass', new mongoose.Schema({
  classId: { type: String, required: true, unique: true },
  name: { type: String, required: true }
}));

const Student = mongoose.model('Student', new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true }, 
  lastName: { type: String, required: true }, 
  grade: { type: String, required: true },
  parentPhone: String,
  registrationDate: { type: Date, default: Date.now },
  monthlyFee: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  livingStatus: { type: String, default: 'home' }
}));

const Homework = mongoose.model('Homework', new mongoose.Schema({
  studentId: String,
  teacherId: String,
  subjectId: String,
  date: { type: String, required: true },
  status: { type: String, enum: ['done', 'not_done'], default: 'done' },
  comment: String
}));

const Attendance = mongoose.model('Attendance', new mongoose.Schema({ 
  studentId: String, date: String, status: String, comment: String, subjectId: String, teacherId: String 
}));

const Grade = mongoose.model('Grade', new mongoose.Schema({ 
  studentId: String, subjectId: String, date: String, grade: Number, comment: String, teacherId: String 
}));

const Payment = mongoose.model('Payment', new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  amount: Number, date: { type: Date, default: Date.now },
  type: { type: String, enum: ['income', 'charge'], default: 'income' },
  forMonth: String, comment: String
}));

const Exam = mongoose.model('Exam', new mongoose.Schema({
  studentId: String, subjectId: String, examName: String, date: String, score: Number
}));

const Subject = mongoose.model('Subject', new mongoose.Schema({
  subjectId: { type: String, unique: true }, name: String, category: String, description: String
}));

const Test = mongoose.model('Test', new mongoose.Schema({
  title: String, grade: String, questions: Array, isActive: Boolean, totalTimeLimit: Number, antiCheatEnabled: Boolean, subjectId: String
}));

const TestResult = mongoose.model('TestResult', new mongoose.Schema({
  testId: String, studentId: String, score: Number, status: String, date: String
}));

// --- AUTH MIDDLEWARE ---
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No Auth' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); } catch (e) { res.status(401).json({ message: 'Invalid Token' }); }
};

// --- API ROUTES ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username.toUpperCase() });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role, specialization: user.specialization, assignedGrades: user.assignedGrades, firstName: user.firstName, lastName: user.lastName, grade: user.grade, mustChangePassword: user.mustChangePassword } });
  } else res.status(400).json({ message: 'Xato!' });
});

app.get('/api/students', auth, async (req, res) => res.json(await Student.find()));
app.get('/api/attendance', auth, async (req, res) => res.json(await Attendance.find()));
app.get('/api/grades', auth, async (req, res) => res.json(await Grade.find()));
app.get('/api/exams', auth, async (req, res) => res.json(await Exam.find()));
app.get('/api/teachers', auth, async (req, res) => res.json(await User.find({ role: { $ne: 'ADMIN' } })));
app.get('/api/subjects', auth, async (req, res) => res.json(await Subject.find()));
app.get('/api/classes', auth, async (req, res) => res.json(await SchoolClass.find()));
app.get('/api/tests', auth, async (req, res) => res.json(await Test.find()));
app.get('/api/test-results', auth, async (req, res) => res.json(await TestResult.find()));

// --- PRODUCTION SETUP ---
// Express server React build fayllarini (dist papkasi) o'qiydi
app.use(express.static(path.join(__dirname, 'dist')));

// API bo'lmagan barcha so'rovlarni React-ga yo'naltirish
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`>>> SERVER ON PORT ${PORT}`));
