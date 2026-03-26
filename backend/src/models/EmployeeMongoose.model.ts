// src/models/EmployeeMongoose.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  role: 'admin' | 'supervisor' | 'operator' | 'technician';
  shift: string;
  status: 'active' | 'inactive' | 'on-leave';
  joiningDate: Date;
  skills: string[];
  certifications: string[];
  phone?: string;
  address?: string;
  emergencyContact?: object;
  password: string;
  fullName: string;
}

const EmployeeSchema = new Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props: { value: string }) => `${props.value} is not a valid email!`
    }
  },
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'supervisor', 'operator', 'technician'],
    required: true,
    default: 'operator'
  },
  shift: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    required: true,
    default: 'active'
  },
  joiningDate: {
    type: Date,
    required: true
  },
  skills: {
    type: [String],
    default: []
  },
  certifications: {
    type: [String],
    default: []
  },
  phone: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  emergencyContact: {
    type: Schema.Types.Mixed,
    required: false
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Virtual for full name
EmployeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook to generate employee ID
EmployeeSchema.pre<IEmployee>('save', async function(next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);