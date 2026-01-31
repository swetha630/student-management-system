const Notification = require('../models/Notification');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Mock Transporter - logs to console instead of sending
// For real email, you would configure SMTP details here
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'ethereal_user', // Mock user
        pass: 'ethereal_pass'  // Mock pass
    }
});

// @desc    Send Notification (and Email)
// @route   POST /api/notifications
// @access  Private (Admin)
const sendNotification = async (req, res) => {
  const { message, type, recipientId } = req.body;

  try {
      // If recipientId is provided, send to one student
      // If not, it's a broadcast to all students
      let recipients = [];
      if (recipientId) {
          const user = await User.findById(recipientId);
          if (user) recipients.push(user);
      } else {
          recipients = await User.find({ role: 'student' });
      }

      // Create Notifications in DB
      const notifications = recipients.map(user => ({
          recipient: user._id,
          sender: req.user._id,
          message,
          type
      }));

      await Notification.insertMany(notifications);

      // Send Emails (Mock)
      recipients.forEach(user => {
          console.log(`[EMAIL MOCK] Sending email to ${user.email}: Subject: New ${type} Notification - Body: ${message}`);
          // In real app:
          // transporter.sendMail({ from: 'admin@college.edu', to: user.email, subject: ..., text: ... });
      });

      res.status(201).json({ message: `Notification sent to ${recipients.length} students` });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to send notification' });
  }
};

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
};

module.exports = { sendNotification, getMyNotifications };
