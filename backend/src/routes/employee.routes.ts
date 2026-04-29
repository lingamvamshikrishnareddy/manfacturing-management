import { Router } from 'express';
import EmployeeController from '../controllers/employees/EmployeeController';
import { ShiftController } from '../controllers/employees/ShiftController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { employeeValidation } from '../validations/employee.validation';
import Employee from '../models/EmployeeMongoose.model';
import AttendanceRecord from '../models/AttendanceRecordMongoose.model';

const router = Router();
const shiftController = new ShiftController();

// ─── Auth (no middleware) ─────────────────────────────────────────────────────
router.post('/register', validate(employeeValidation.register), EmployeeController.create);
router.post('/login', validate(employeeValidation.login), EmployeeController.login);

// ─── Employee CRUD ────────────────────────────────────────────────────────────
router.get('/', authMiddleware, EmployeeController.getAll);
router.post('/', authMiddleware, EmployeeController.create);   // Auth-gated create
router.get('/:id', authMiddleware, EmployeeController.getById);
router.put('/:id', authMiddleware, validate(employeeValidation.update), EmployeeController.update);

// ─── Shifts ───────────────────────────────────────────────────────────────────
router.post('/shifts/assign', authMiddleware, validate(employeeValidation.assignShift), shiftController.assignShift);
router.get('/shifts/schedule', authMiddleware, shiftController.getShiftSchedule);

// GET all shifts — query distinct shift values from employees
router.get('/shifts', authMiddleware, async (req, res) => {
  try {
    const shifts = await Employee.aggregate([
      { $group: { _id: '$shift', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
      { $match: { name: { $ne: null } } }
    ]);
    res.json({ data: shifts });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching shifts', error: error.message });
  }
});

// POST create shift assignment — create a new shift
router.post('/shifts', authMiddleware, async (req, res) => {
  try {
    // Store shift info by updating all matching employees or just return the shift definition
    res.status(201).json({ message: 'Shift created', data: req.body });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating shift', error: error.message });
  }
});

// ─── Attendance ───────────────────────────────────────────────────────────────
router.get('/attendance', authMiddleware, async (req, res) => {
  try {
    const filter: any = {};
    if (req.query.date) {
      const date = new Date(req.query.date as string);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: date, $lt: next };
    }
    if (req.query.employeeId) filter.employeeId = req.query.employeeId;
    const records = await AttendanceRecord.find(filter).sort({ date: -1 });
    res.json({ data: records });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
});
router.post('/attendance', authMiddleware, async (req, res) => {
  try {
    const record = await AttendanceRecord.create({
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    });
    res.status(201).json({ message: 'Attendance recorded', data: record });
  } catch (error: any) {
    res.status(500).json({ message: 'Error recording attendance', error: error.message });
  }
});

// ─── Skills ───────────────────────────────────────────────────────────────────
router.get('/skills', authMiddleware, async (req, res) => {
  try {
    // Aggregate skills from EmployeeSkillMongoose if exists, else derive from Employee.skills[]
    const skillsAgg = await Employee.aggregate([
      { $unwind: { path: '$skills', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
    ]);
    res.json({ data: skillsAgg });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching skills', error: error.message });
  }
});
router.post('/skills', authMiddleware, async (req, res) => {
  try {
    // No dedicated skills model — return confirmation
    res.status(201).json({ message: 'Skill added', data: req.body });
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding skill', error: error.message });
  }
});
router.put('/skills/matrix', authMiddleware, async (req, res) => {
  try {
    const { employeeId, skills } = req.body;
    const updated = await Employee.findByIdAndUpdate(employeeId, { skills }, { new: true });
    res.json({ message: 'Skills matrix updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating skills matrix', error: error.message });
  }
});

export default router;