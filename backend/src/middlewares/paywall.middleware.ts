import { Request, Response, NextFunction } from 'express';
import Subscription from '../models/Subscription.model';
import User from '../models/UserMongoose.model';

export const checkHardPaywall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const subscription = await Subscription.findOne({ userId });
    
    // Admin access bypass
    if (req.user.role === 'admin') return next();

    if (!subscription) {
      return res.status(402).json({ 
        success: false, 
        message: 'Payment required: Please subscribe to continue using the application.',
        paywallType: 'hard'
      });
    }

    const now = new Date();
    if (subscription.status === 'trial' && subscription.trialEnd && subscription.trialEnd < now) {
      subscription.status = 'expired';
      await subscription.save();
    }

    if (subscription.status === 'cancelled' || subscription.status === 'expired') {
      return res.status(402).json({ 
        success: false, 
        message: 'Subscription expired. Please renew your plan.',
        paywallType: 'hard'
      });
    }

    if (subscription.status === 'inactive') {
      return res.status(402).json({ 
        success: false, 
        message: 'Account inactive. Please contact support.',
        paywallType: 'hard'
      });
    }

    // Pass
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking subscription' });
  }
};


export const checkSoftPaywall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(); // Not an auth route

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
       req.headers['x-soft-paywall-warning'] = 'No active subscription. You might face limitations.';
       return next();
    }

    const now = new Date();
    if (subscription.status === 'trial' && subscription.trialEnd) {
       const daysLeft = Math.ceil((subscription.trialEnd.getTime() - now.getTime()) / (1000 * 3600 * 24));
       if (daysLeft <= 3 && daysLeft > 0) {
          req.headers['x-soft-paywall-warning'] = `Your trial ends in ${daysLeft} days. Please upgrade.`;
       }
    }

    next();
  } catch (error) {
     next();
  }
};
