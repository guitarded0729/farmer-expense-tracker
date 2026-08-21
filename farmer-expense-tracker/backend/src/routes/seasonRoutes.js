import { Router } from 'express';
import { body } from 'express-validator';
import {
  getSeasons,
  getSeasonById,
  createSeason,
  updateSeason,
  deleteSeason,
} from '../controllers/seasonController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.get('/', getSeasons);
router.get('/:id', getSeasonById);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Season name is required')],
  validateRequest,
  createSeason
);

router.put('/:id', updateSeason);
router.delete('/:id', deleteSeason);

export default router;
