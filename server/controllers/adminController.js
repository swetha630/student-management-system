const StudentProfile = require('../models/StudentProfile');
const Target = require('../models/Target');
const User = require('../models/User');

// @desc    Get all students with progress
// @route   GET /api/admin/students
// @access  Private (Admin)
const getStudents = async (req, res) => {
  const profiles = await StudentProfile.find({}).populate('user', 'name email');
  
  const studentsWithProgress = await Promise.all(profiles.map(async (profile) => {
      const targets = await Target.find({ student: profile.user._id });
      const totalTargets = targets.length;
      const completedTargets = targets.filter(t => t.status === 'completed').length;
      const progress = totalTargets === 0 ? 0 : Math.round((completedTargets / totalTargets) * 100);
      
      return {
          ...profile.toObject(),
          progress,
          totalTargets,
          completedTargets
      };
  }));

  res.json(studentsWithProgress);
};

// @desc    Assign target to student
// @route   POST /api/admin/targets
// @access  Private (Admin)
const assignTarget = async (req, res) => {
  const { studentId, semester, title, description, deadline } = req.body;

  const target = await Target.create({
    student: studentId,
    semester,
    title,
    description,
    deadline,
    assignedBy: req.user._id,
  });

  if (target) {
    res.status(201).json(target);
  } else {
    res.status(400).json({ message: 'Invalid target data' });
  }
};

// @desc    Get scholarship eligibility
// @route   GET /api/admin/scholarship
// @access  Private (Admin)
const getScholarshipEligible = async (req, res) => {
    // Example criteria: CGPA > 8.5
    const students = await StudentProfile.find({ cgpa: { $gt: 8.5 } }).populate('user', 'name email');
    res.json(students);
}

module.exports = { getStudents, assignTarget, getScholarshipEligible };
