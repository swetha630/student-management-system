const StudentProfile = require('../models/StudentProfile');
const Target = require('../models/Target');
const User = require('../models/User');

// @desc    Get current student profile
// @route   GET /api/student/profile
// @access  Private (Student)
const getProfile = async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id }).populate('user', 'name email');
  if (profile) {
    res.json(profile);
  } else {
    res.status(404).json({ message: 'Profile not found' });
  }
};

// @desc    Update student profile
// @route   PUT /api/student/profile
// @access  Private (Student)
const updateProfile = async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });

  if (profile) {
    profile.skills = req.body.skills || profile.skills;
    profile.achievements = req.body.achievements || profile.achievements;
    profile.phone = req.body.phone || profile.phone;
    profile.address = req.body.address || profile.address;
    profile.cgpa = req.body.cgpa || profile.cgpa;
    profile.currentSemester = req.body.currentSemester || profile.currentSemester;
    profile.codingProfiles = req.body.codingProfiles || profile.codingProfiles;
    profile.technicalSkills = req.body.technicalSkills || profile.technicalSkills;
    
    // New Fields
    profile.socialLinks = req.body.socialLinks || profile.socialLinks;
    profile.education = req.body.education || profile.education;
    profile.projects = req.body.projects || profile.projects;
    profile.internships = req.body.internships || profile.internships;
    profile.certifications = req.body.certifications || profile.certifications;
    profile.semesterResults = req.body.semesterResults || profile.semesterResults;

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } else {
    res.status(404).json({ message: 'Profile not found' });
  }
};

// @desc    Get student targets
// @route   GET /api/student/targets
// @access  Private (Student)
const getTargets = async (req, res) => {
  const targets = await Target.find({ student: req.user._id });
  res.json(targets);
};

// @desc    Update target status
// @route   PUT /api/student/targets/:id
// @access  Private (Student)
const updateTargetStatus = async (req, res) => {
  const target = await Target.findById(req.params.id);

  if (target) {
    if (target.student.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    target.status = req.body.status || target.status;
    const updatedTarget = await target.save();
    res.json(updatedTarget);
  } else {
    res.status(404).json({ message: 'Target not found' });
  }
};


module.exports = { getProfile, updateProfile, getTargets, updateTargetStatus };
