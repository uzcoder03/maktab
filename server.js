
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'cyber_secret_2025';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('>>> DB CONNECTED'))
  .catch(err => console.error('>>> DB ERROR:', err.message));

// --- MODELLAR ---
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'TEACHER', 'ACADEMIC'], required: true },
  firstName: String, 
  lastName: String, 
  specialization: String, // Bu fan nomi yoki to'garak nomi bo'ladi
  assignedGrades: [String]
}));

const Student = mongoose.model('Student', new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true }, 
  lastName: { type: String, required: true }, 
  grade: { type: String, required: true },
  parentPhone: String,
  parentName: String,
  registrationDate: { type: Date, default: Date.now },
  monthlyFee: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  address: String,
  hasFood: { type: Boolean, default: false },
  hasTransport: { type: Boolean, default: false },
  livingStatus: { type: String, default: 'home' }
}));

const Attendance = mongoose.model('Attendance', new mongoose.Schema({ 
  studentId: String, 
  date: String, 
  status: String, 
  comment: String,
  subjectId: String, // Fan yoki To'garak IDsi
  teacherId: String  // Qaysi o'qituvchi davomat qilgani
}));

const Payment = mongoose.model('Payment', new mongoose.Schema({
  studentId: String,
  amount: Number,
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['income', 'charge'], default: 'income' },
  forMonth: String,
  comment: String
}));

const ClubMember = mongoose.model('ClubMember', new mongoose.Schema({
  studentId: String,
  teacherId: String, // Har bir o'qituvchining o'z to'garagi
  joinDate: { type: Date, default: Date.now }
}));

const Grade = mongoose.model('Grade', new mongoose.Schema({ 
  studentId: String, 
  subjectId: String, 
  date: String, 
  grade: Number, 
  comment: String,
  teacherId: String
}));

// --- AUTH MIDDLEWARE ---
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Ruxsat yo\'q' });
  try { 
    req.user = jwt.verify(token, JWT_SECRET); 
    next(); 
  } catch (e) { 
    res.status(401).json({ message: 'Token muddati tugagan' }); 
  }
};

// --- API ---

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role, specialization: user.specialization, assignedGrades: user.assignedGrades, firstName: user.firstName, lastName: user.lastName } });
  } else res.status(400).json({ message: 'Login yoki parol xato!' });
});

// Students
app.get('/api/students', auth, async (req, res) => res.json(await Student.find()));
app.post('/api/students', auth, async (req, res) => {
  try {
    const s = new Student({ ...req.body, balance: -req.body.monthlyFee });
    await s.save();
    
    // Avtomatik qarzdorlik tranzaksiyasi
    await new Payment({
      studentId: s._id,
      amount: req.body.monthlyFee,
      type: 'charge',
      forMonth: new Date().toISOString().slice(0, 7),
      comment: 'Yangi o\'quvchi: 1-oylik to\'lov hisoblandi'
    }).save();

    res.json(s);
  } catch(e) { res.status(400).json({ message: e.message }); }
});

// Payments
app.get('/api/students/:id/payments', auth, async (req, res) => res.json(await Payment.find({ studentId: req.params.id }).sort({ date: -1 })));
app.post('/api/payments', auth, async (req, res) => {
  const p = new Payment(req.body);
  await p.save();
  await Student.findByIdAndUpdate(req.body.studentId, { $inc: { balance: req.body.amount } });
  res.json(p);
});

// Club Logic (Teacher specific)
app.get('/api/club/members', auth, async (req, res) => {
  const teacherId = req.user.role === 'ADMIN' ? { $exists: true } : req.user.id;
  res.json(await ClubMember.find({ teacherId }));
});

app.post('/api/club/members', auth, async (req, res) => {
  const { studentId, isMember } = req.body;
  if (isMember) {
    await ClubMember.findOneAndUpdate(
      { studentId, teacherId: req.user.id }, 
      { studentId, teacherId: req.user.id }, 
      { upsert: true }
    );
  } else {
    await ClubMember.findOneAndDelete({ studentId, teacherId: req.user.id });
  }
  res.json({ ok: true });
});

// Academic
app.get('/api/attendance', auth, async (req, res) => res.json(await Attendance.find()));
app.post('/api/attendance', auth, async (req, res) => {
  const records = req.body.map(r => ({ ...r, teacherId: req.user.id }));
  await Attendance.insertMany(records);
  res.json({ ok: true });
});
app.put('/api/attendance/:id', auth, async (req, res) => {
  await Attendance.findByIdAndUpdate(req.params.id, { comment: req.body.comment });
  res.json({ ok: true });
});

app.get('/api/grades', auth, async (req, res) => res.json(await Grade.find()));
app.post('/api/grades', auth, async (req, res) => {
  const records = req.body.map(r => ({ ...r, teacherId: req.user.id }));
  await Grade.insertMany(records);
  res.json({ ok: true });
});

app.get('/api/teachers', auth, async (req, res) => res.json(await User.find({ role: { $ne: 'ADMIN' } })));
app.post('/api/teachers', auth, async (req, res) => {
  const hp = await bcrypt.hash(req.body.password, 10);
  const u = new User({ ...req.body, password: hp });
  await u.save(); res.json(u);
});

app.listen(8080, () => console.log('>>> SERVER ON 8080'));
