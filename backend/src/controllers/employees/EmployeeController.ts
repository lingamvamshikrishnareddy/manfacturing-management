import { Request, Response } from 'express';
import Employee from '../../models/EmployeeMongoose.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class EmployeeController {
  async create(req: Request, res: Response) {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const employee = await Employee.create({
        ...req.body,
        password: hashedPassword
      });
      res.status(201).json({ message: 'Employee created successfully', data: employee });
    } catch (error: any) {
      res.status(500).json({ message: 'Error creating employee', error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const employee = await Employee.findOne({ email });

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      const isValidPassword = await bcrypt.compare(password, employee.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: employee.id, role: employee.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );

      res.json({ token });
    } catch (error: any) {
      res.status(500).json({ message: 'Error during login', error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const employees = await Employee.find().select('-password');
      res.json({ data: employees });
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(id).select('-password');

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json({ data: employee });
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching employee', error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const updated = await Employee.findByIdAndUpdate(id, updateData, { new: true });

      if (!updated) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      const employee = await Employee.findById(updated._id).select('-password');

      res.json({ message: 'Employee updated successfully', data: employee });
    } catch (error: any) {
      res.status(500).json({ message: 'Error updating employee', error: error.message });
    }
  }
}

export default new EmployeeController();