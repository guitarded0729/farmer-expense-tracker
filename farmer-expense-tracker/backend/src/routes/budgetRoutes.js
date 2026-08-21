import { Router } from 'express';
import { body } from 'express-validator';
import {
  getBudgets,
  upsertBudget,
  updateBudgetById,
} from '../controllers/budgetController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.get('/', getBudgets);

router.post(
  '/',
  [
    body('farmerId').notEmpty().withMessage('Farmer ID is required'),
    body('seasonId').notEmpty().withMessage('Season ID is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be non-negative'),
  ],
  validateRequest,
  upsertBudget
);

router.put('/:id', updateBudgetById);

export default router;
