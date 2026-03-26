import express from 'express';
import SubscriptionController from '../controllers/subscription/SubscriptionController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authMiddleware);

// Subscription routes
router.get('/my-subscription', SubscriptionController.getSubscription);
router.post('/create-order', SubscriptionController.createOrder);
router.post('/verify', SubscriptionController.verifyPayment);

// Invoice routes
router.get('/invoices', SubscriptionController.getInvoices);
router.get('/invoices/:id', SubscriptionController.getInvoice);

export default router;
