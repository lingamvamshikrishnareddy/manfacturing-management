import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface User extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'operator' | 'supervisor';
  department: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  googleId?: string;
  avatar?: string;
}

const UserSchema: Schema<User> = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: false,
    minlength: 0
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'operator', 'supervisor'],
    default: 'operator'
  },
  department: {
    type: String,
    required: true,
    default: 'General'
  },
  permissions: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ isActive: 1 });

// Pre-save hook to update the updatedAt field
UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<User>('User', UserSchema);

export default User;