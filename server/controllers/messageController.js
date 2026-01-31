const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send Message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  const { recipientId, content } = req.body;

  try {
    const message = await Message.create({
        sender: req.user._id,
        recipient: recipientId,
        content
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// @desc    Get Messages between current user and another user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
    const { userId } = req.params;
    
    // Find messages where (sender is me AND recipient is them) OR (sender is them AND recipient is me)
    const messages = await Message.find({
        $or: [
            { sender: req.user._id, recipient: userId },
            { sender: userId, recipient: req.user._id }
        ]
    }).sort({ createdAt: 1 });

    res.json(messages);
};

// @desc    Get list of users I have chatted with (or all students if admin)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
    if (req.user.role === 'admin') {
        // Admin can chat with all students
        const students = await User.find({ role: 'student' }).select('name email');
        res.json(students);
    } else {
        // Student can chat with Admin(s)
        const admins = await User.find({ role: 'admin' }).select('name email');
        res.json(admins);
    }
}

module.exports = { sendMessage, getMessages, getConversations };
