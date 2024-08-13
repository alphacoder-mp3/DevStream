import { Router } from 'express';
import {
  getChannelStats,
  getChannelVideos,
} from '../controllers/dashboard.controller';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route('/stats').get(getChannelStats);
router.route('/videos').get(getChannelVideos);

export default router;
