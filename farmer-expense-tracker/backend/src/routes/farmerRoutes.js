import { Router } from 'express';
import { body } from 'express-validator';
import {
  getFarmers,
  getFarmerById,
  createFarmer,
  updateFarmer,
  deleteFarmer,
} from '../controllers/farmerController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.get('/', getFarmers);
router.get('/:id', getFarmerById);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Farmer name is required'),
    body('farmName').trim().notEmpty().withMessage('Farm name is required'),
  ],
  validateRequest,
  createFarmer
);

router.put('/:id', updateFarmer);
router.delete('/:id', deleteFarmer);

export default router;
