
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
  role: { type: String, enum: ['ADMIN', 'TEACHER', 'ACADEMIC'], required: true },
  firstName: String, 
  lastName: String, 
  specialization: String,
  assignedGrades: [String]
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

// --- AUTH ---
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No Auth' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); } catch (e) { res.status(401).json({ message: 'Invalid Token' }); }
};

// --- API ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role, specialization: user.specialization, assignedGrades: user.assignedGrades, firstName: user.firstName, lastName: user.lastName } });
  } else res.status(400).json({ message: 'Xato!' });
});

app.put('/api/user/password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User topilmadi' });
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Eski parol noto\'g\'ri' });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  res.json({ message: 'Muvaffaqiyatli yangilandi' });
});

// --- CLASSES API ---
app.get('/api/classes', auth, async (req, res) => res.json(await SchoolClass.find()));
app.post('/api/classes', auth, async (req, res) => {
  const c = new SchoolClass(req.body);
  await c.save();
  res.json(c);
});
app.delete('/api/classes/:id', auth, async (req, res) => {
  await SchoolClass.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

app.get('/api/homework', auth, async (req, res) => res.json(await Homework.find()));
app.post('/api/homework', auth, async (req, res) => {
  const records = req.body.map(r => ({ ...r, teacherId: req.user.id }));
  for (const rec of records) {
    await Homework.findOneAndUpdate(
      { studentId: rec.studentId, date: rec.date, subjectId: rec.subjectId },
      rec,
      { upsert: true }
    );
  }
  res.json({ ok: true });
});

app.get('/api/students', auth, async (req, res) => res.json(await Student.find()));
app.post('/api/students', auth, async (req, res) => {
  const s = new Student(req.body);
  await s.save();
  res.json(s);
});
app.put('/api/students/:id', auth, async (req, res) => {
  const s = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(s);
});

app.get('/api/attendance', auth, async (req, res) => res.json(await Attendance.find()));
app.post('/api/attendance', auth, async (req, res) => {
  const records = req.body.map(r => ({ ...r, teacherId: req.user.id }));
  await Attendance.insertMany(records);
  res.json({ ok: true });
});

app.get('/api/grades', auth, async (req, res) => res.json(await Grade.find()));
app.post('/api/grades', auth, async (req, res) => {
  const records = req.body.map(r => ({ ...r, teacherId: req.user.id }));
  await Grade.insertMany(records);
  res.json({ ok: true });
});

app.get('/api/exams', auth, async (req, res) => res.json(await Exam.find()));
app.post('/api/exams', auth, async (req, res) => {
  const records = Array.isArray(req.body) ? req.body : [req.body];
  await Exam.insertMany(records);
  res.json({ ok: true });
});

app.get('/api/teachers', auth, async (req, res) => res.json(await User.find({ role: { $ne: 'ADMIN' } })));
app.post('/api/teachers', auth, async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);
  const u = new User({ ...req.body, password });
  await u.save();
  res.json(u);
});
app.delete('/api/teachers/:id', auth, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

app.get('/api/subjects', auth, async (req, res) => res.json(await Subject.find()));
app.post('/api/subjects', auth, async (req, res) => {
  const s = new Subject(req.body);
  await s.save();
  res.json(s);
});
app.delete('/api/subjects/:id', auth, async (req, res) => {
  await Subject.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

app.post('/api/payments/bulk-charge', auth, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  const { forMonth, grade } = req.body;
  try {
    const students = await Student.find(grade === 'All' ? {} : { grade });
    const charges = [];
    for (const student of students) {
      const existing = await Payment.findOne({ studentId: student._id, type: 'charge', forMonth });
      if (!existing && student.monthlyFee > 0) {
        charges.push({
          studentId: student._id,
          amount: student.monthlyFee,
          type: 'charge',
          forMonth,
          comment: `${forMonth} oyi uchun oylik to'lov majburiyati`
        });
        await Student.findByIdAndUpdate(student._id, { $inc: { balance: -student.monthlyFee } });
      }
    }
    if (charges.length > 0) await Payment.insertMany(charges);
    res.json({ success: true, count: charges.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/students/:id/payments', auth, async (req, res) => {
  const payments = await Payment.find({ studentId: req.params.id }).sort({ date: -1 });
  res.json(payments);
});

app.post('/api/payments', auth, async (req, res) => {
  const p = new Payment(req.body); 
  await p.save();
  const multiplier = req.body.type === 'income' ? 1 : -1;
  await Student.findByIdAndUpdate(req.body.studentId, { $inc: { balance: req.body.amount * multiplier } });
  res.json(p);
});
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`>>> SERVER ON PORT ${PORT}`));
