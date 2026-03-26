import { Request, Response } from 'express';
import Employee from '../../models/EmployeeMongoose.model';
import logger from '../../utils/logger';

export class ShiftController {
  public async assignShift(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, shift, startDate, endDate } = req.body;

      const updated = await Employee.findByIdAndUpdate(employeeId, {
          shift,
          // Assuming shiftSchedule is a JSON field or separate table
        }, { new: true }
      );

      if (!updated) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      const employee = await Employee.findById(updated._id);

      res.json({
        message: 'Shift assigned successfully',
        employee
      });
    } catch (error: any) {
      logger.error('Error assigning shift:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  public async getShiftSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { department, date } = req.query;

      const schedule = await Employee.find({
        department: department as string
      }).select('firstName lastName shift');

      res.json({
        message: 'Shift schedule retrieved successfully',
        schedule
      });
    } catch (error: any) {
      logger.error('Error retrieving shift schedule:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
}
