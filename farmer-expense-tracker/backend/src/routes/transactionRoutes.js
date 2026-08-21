import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.get('/', getTransactions);
router.get('/:id', getTransactionById);

router.post(
  '/',
  [
    body('seasonId').notEmpty().withMessage('Season ID is required'),
    body('farmerId').notEmpty().withMessage('Farmer ID is required'),
    body('type').isIn(['expense', 'income']).withMessage('Type must be expense or income'),
    body('category').notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  ],
  validateRequest,
  createTransaction
);

router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
