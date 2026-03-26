// src/models/EmployeeSkillMongoose.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeSkill extends Document {
  employeeId: string;
  skillName: string;
  skillCategory: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number | null;
  certificationRequired: boolean;
  certificationName?: string | null;
  certificationDate?: Date | string | null;
  certificationExpiryDate?: Date | string | null;
  verifiedBy?: string | null;
  verificationDate?: Date | string | null;
  isActive: boolean;
  notes?: string | null;
  isCertificationExpired: boolean;
  isCertificationExpiringSoon: boolean;
}

const EmployeeSkillSchema = new Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'Employee'
  },
  skillName: {
    type: String,
    required: true
  },
  skillCategory: {
    type: String,
    required: true
  },
  proficiencyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true,
    default: 'beginner'
  },
  yearsOfExperience: {
    type: Number,
    required: false,
    min: 0,
    max: 50
  },
  certificationRequired: {
    type: Boolean,
    required: true,
    default: false
  },
  certificationName: {
    type: String,
    required: false
  },
  certificationDate: {
    type: Date,
    required: false
  },
  certificationExpiryDate: {
    type: Date,
    required: false
  },
  verifiedBy: {
    type: String,
    required: false
  },
  verificationDate: {
    type: Date,
    required: false
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Virtual: whether the certification is expired
EmployeeSkillSchema.virtual('isCertificationExpired').get(function() {
  if (!this.certificationExpiryDate) return false;
  const expiry = new Date(this.certificationExpiryDate);
  return expiry.getTime() < Date.now();
});

// Virtual: whether the certification expires within next 30 days
EmployeeSkillSchema.virtual('isCertificationExpiringSoon').get(function() {
  if (!this.certificationExpiryDate) return false;
  const expiry = new Date(this.certificationExpiryDate);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime());
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return expiry.getTime() <= thirtyDaysFromNow.getTime() && expiry.getTime() >= now.getTime();
});

// Helper function to parse dates
function parseToDate(val: Date | string | null | undefined): Date | null {
  if (val == null) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val;
  }
  const d = new Date(String(val));
  if (isNaN(d.getTime())) return null;
  return d;
}

// Validation middleware
EmployeeSkillSchema.pre<IEmployeeSkill>('validate', function(next) {
  // Certification details required validation
  if (this.certificationRequired && (!this.certificationName || String(this.certificationName).trim().length === 0)) {
    throw new Error('Certification name is required when certification is mandatory');
  }
  
  // Certification date logic validation
  if (this.certificationDate && this.certificationExpiryDate) {
    const startDate = parseToDate(this.certificationDate);
    const endDate = parseToDate(this.certificationExpiryDate);
    
    if (!startDate || !endDate) {
      throw new Error('Invalid certification dates provided');
    }
    
    if (startDate.getTime() >= endDate.getTime()) {
      throw new Error('Certification expiry date must be after certification date');
    }
  }
  
  next();
});

// Indexes
EmployeeSkillSchema.index({ employeeId: 1, skillName: 1 }, { unique: true });
EmployeeSkillSchema.index({ skillCategory: 1 });
EmployeeSkillSchema.index({ proficiencyLevel: 1 });
EmployeeSkillSchema.index({ certificationRequired: 1 });
EmployeeSkillSchema.index({ certificationExpiryDate: 1 });

export default mongoose.model<IEmployeeSkill>('EmployeeSkill', EmployeeSkillSchema);