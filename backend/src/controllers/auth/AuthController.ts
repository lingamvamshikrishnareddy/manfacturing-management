import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import User from '../../models/UserMongoose.model';
import { authConfig } from '../../config/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'your-google-client-id');

class AuthController {
  
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role, department, permissions, isActive } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists',
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'operator',
        department: department || 'General',
        permissions: permissions || [],
        isActive: isActive !== undefined ? isActive : true,
      });

      await newUser.save();

      // Generate token
      const token = jwt.sign(
        { userId: newUser._id, role: newUser.role },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpiresIn }
      );

      // Return user data without password
      const userData = newUser.toObject();
      const { password: _, ...userDataWithoutPassword } = userData;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user: userDataWithoutPassword, token },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive',
        });
      }

      // Check password - users without password (OAuth users) cannot login with password
      if (!user.password) {
        return res.status(401).json({
          success: false,
          message: 'Please use Google OAuth to login',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpiresIn }
      );

      // Return user data without password
      const userData = user.toObject();
      const { password: _, ...userDataWithoutPassword } = userData;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user: userDataWithoutPassword, token },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      // In JWT, logout is typically handled client-side by removing the token
      // But we can implement token blacklisting if needed
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      // User is attached to request by auth middleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Return user data without password
      const userData = req.user.toObject();
      delete userData.password;

      res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        data: userData,
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user',
      });
    }
  }

  static async googleLogin(req: Request, res: Response) {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({
          success: false,
          message: 'Google credential is required',
        });
      }

      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Google token',
        });
      }

      const { email, name, picture } = payload;

      // Check if user exists
      let user = await User.findOne({ email });

      if (!user) {
        // Create new user if doesn't exist
        user = new User({
          name: name || email?.split('@')[0],
          email,
          password: '', // No password for OAuth users
          role: 'operator',
          department: 'General',
          permissions: [],
          isActive: true,
          avatar: picture,
        });

        await user.save();
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpiresIn }
      );

      // Return user data without password
      const userData = user.toObject();
      delete userData.password;

      res.status(200).json({
        success: true,
        message: 'Google login successful',
        data: { user: userData, token },
      });
    } catch (error) {
      console.error('Google login error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Google login failed',
      });
    }
  }
}

export default AuthController;