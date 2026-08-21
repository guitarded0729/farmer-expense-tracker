import { Router } from 'express';
import { body } from 'express-validator';
import {
  getFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
} from '../controllers/fieldController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.get('/', getFields);
router.get('/:id', getFieldById);

router.post(
  '/',
  [
    body('farmerId').notEmpty().withMessage('Farmer ID is required'),
    body('name').trim().notEmpty().withMessage('Field name is required'),
  ],
  validateRequest,
  createField
);

router.put('/:id', updateField);
router.delete('/:id', deleteField);

export default router;
