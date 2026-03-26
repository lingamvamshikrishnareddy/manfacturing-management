import { Request, Response } from 'express';
import Production from '../../models/Production.model';

class ScheduleController {
    async createSchedule(req: Request, res: Response) {
      try {
        const schedule = new Production(req.body);
        await schedule.save();
        res.status(201).json(schedule);
      } catch (error: any) {
        res.status(500).json({ message: 'Error creating schedule', error: error.message });
      }
    }

    async getSchedule(req: Request, res: Response) {
      try {
        const schedules = await Production.find(req.query);
        res.json(schedules);
      } catch (error: any) {
        res.status(500).json({ message: 'Error fetching schedules', error: error.message });
      }
    }

    async getProductionBatches(req: Request, res: Response) {
      try {
        const batches = await Production.find({}).limit(10).sort({ createdAt: -1 });
        res.json({ data: batches });
      } catch (error: any) {
        res.status(500).json({ message: 'Error fetching production batches', error: error.message });
      }
    }
  }

export default new ScheduleController();