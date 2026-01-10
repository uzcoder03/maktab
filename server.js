
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

// --- MODELLAR (Oldingi kodlar bilan bir xil) ---
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

// Boshqa barcha modellar... (Attendance, Grade, Payment, Exam, Subject, Test, TestResult)
// ... (Qisqalik uchun tushirib qoldirildi, lekin sizning server.js da bo'lishi kerak)

// --- AUTH MIDDLEWARE ---
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No Auth' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); } catch (e) { res.status(401).json({ message: 'Invalid Token' }); }
};

// --- API ROUTES ---
app.get('/api/health', (req, res) => res.json({ status: 'UP', timestamp: new Date() }));

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username.toUpperCase() });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role, specialization: user.specialization, assignedGrades: user.assignedGrades, firstName: user.firstName, lastName: user.lastName, grade: user.grade, mustChangePassword: user.mustChangePassword } });
  } else res.status(400).json({ message: 'Xato!' });
});

// Boshqa barcha API yo'nalishlari...
// app.get('/api/students', auth, ...)

// --- PRODUCTION SETUP (MUHIM!) ---
const distPath = path.join(__dirname, 'dist');

// Express build papkasini (dist) tanishi kerak
app.use(express.static(distPath));

// API bo'lmagan barcha so'rovlarni React-ning index.html fayliga yo'naltirish
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> SERVER RUNNING ON PORT ${PORT}`);
});
