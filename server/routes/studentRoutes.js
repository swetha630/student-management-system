const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getTargets, updateTargetStatus } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.route('/targets').get(protect, getTargets);
router.route('/targets/:id').put(protect, updateTargetStatus);

module.exports = router;
