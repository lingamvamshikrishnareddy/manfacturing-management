import { Request, Response } from 'express';
import Employee from '../../models/EmployeeMongoose.model';
import AttendanceRecord from '../../models/AttendanceRecordMongoose.model';
import Production from '../../models/Production.model';
import Quality from '../../models/QualityMongoose.model';
import mongoose from 'mongoose';

export class DashboardController {
  async getKPIs(req: Request, res: Response) {
    try {
      // Get employee count
      const employeeCount = await Employee.countDocuments();

      // Get active employees
      const activeEmployees = await Employee.countDocuments({
        status: 'active'
      });

      // Get today's attendance
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysAttendance = await AttendanceRecord.countDocuments({
        date: {
          $gte: today,
          $lt: tomorrow
        },
        status: 'present'
      });

      // Get production metrics (simplified)
      const totalProduction = await Production.countDocuments({ status: 'completed' });

      // Get quality metrics
      const qualityChecks = await Quality.countDocuments();
      const passedQuality = await Quality.countDocuments({
        status: 'passed'
      });

      const qualityRate = qualityChecks > 0 ? (passedQuality / qualityChecks) * 100 : 0;

      // Mock some KPIs for now
      const kpis = [
        {
          id: '1',
          label: 'Total Employees',
          value: employeeCount,
          unit: '',
          trend: 2.1,
          target: employeeCount + 10,
          category: 'production'
        },
        {
          id: '2',
          label: 'Active Employees',
          value: activeEmployees,
          unit: '',
          trend: 1.5,
          target: employeeCount,
          category: 'production'
        },
        {
          id: '3',
          label: 'Today\'s Attendance',
          value: todaysAttendance,
          unit: '',
          trend: 5.2,
          target: activeEmployees,
          category: 'production'
        },
        {
          id: '4',
          label: 'Production Output',
          value: totalProduction,
          unit: 'units',
          trend: 3.1,
          target: totalProduction + 50,
          category: 'production'
        },
        {
          id: '5',
          label: 'Quality Rate',
          value: Math.round(qualityRate * 100) / 100,
          unit: '%',
          trend: -0.5,
          target: 95,
          category: 'quality'
        },
        {
          id: '6',
          label: 'Efficiency Rate',
          value: 87.5,
          unit: '%',
          trend: 1.2,
          target: 90,
          category: 'efficiency'
        }
      ];

      res.json({ data: kpis });
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching KPIs', error: error.message });
    }
  }
}

export default new DashboardController();