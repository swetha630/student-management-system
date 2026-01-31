const express = require('express');
const router = express.Router();
const { sendNotification, getMyNotifications } = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, sendNotification);
router.route('/').get(protect, getMyNotifications);

module.exports = router;
