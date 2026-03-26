// src/utils/database.ts
import mongoose from 'mongoose';
import { dbConfig } from '../config/database';

// Import Mongoose models
import '../models/EmployeeMongoose.model';
import '../models/AttendanceRecordMongoose.model';
import '../models/EmployeeSkillMongoose.model';
import '../models/InventoryMongoose.model';
import '../models/QualityMongoose.model';
import '../models/ShiftMongoose.model';
import '../models/Equipment.model';
import '../models/Maintenance.model';
import '../models/Production.model';

const connectDB = async () => {
  try {
    await mongoose.connect(dbConfig.mongoUri, dbConfig.options);
    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;