const mongoose = require('mongoose');

const studentProfileSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  enrollmentNo: {
    type: String,
    required: true,
    unique: true,
  },
  branch: {
    type: String,
    required: true,
  },
  currentSemester: {
    type: Number,
    required: true,
    default: 1,
  },
  cgpa: {
    type: Number,
    default: 0.0,
  },
  skills: [String],
  technicalSkills: [{
    category: String,
    items: String
  }],
  achievements: [String],
  phone: String,
  address: String,
  socialLinks: {
    linkedin: String,
    github: String,
    leetcode: String,
    other: String
  },
  education: {
    ssc: {
      school: String,
      year: String,
      percentage: String
    },
    intermediate: {
      college: String,
      year: String,
      percentage: String
    },
    btech: {
      college: String,
      year: String, // Expected graduation
      currentCgpa: String
    }
  },
  projects: [{
    title: String,
    description: String,
    techStack: String,
    link: String
  }],
  internships: [{
    company: String,
    role: String,
    duration: String,
    description: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    year: String,
    link: String
  }],
  semesterResults: [{
    semester: Number,
    sgpa: Number,
    cgpa: Number
  }],
  codingProfiles: [{
    platform: String,
    handle: String,
    link: String
  }],
}, {
  timestamps: true,
});

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

module.exports = StudentProfile;
