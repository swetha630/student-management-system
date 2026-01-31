const express = require('express');
const router = express.Router();
const { getStudents, assignTarget, getScholarshipEligible } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/students').get(protect, admin, getStudents);
router.route('/targets').post(protect, admin, assignTarget);
router.route('/scholarship').get(protect, admin, getScholarshipEligible);

module.exports = router;
