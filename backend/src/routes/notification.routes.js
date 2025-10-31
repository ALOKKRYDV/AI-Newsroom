const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const prisma = require('../config/database');

const router = express.Router();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { unreadOnly = false, limit = 20 } = req.query;

    const where = {
      userId: req.userId,
      ...(unreadOnly === 'true' && { read: false })
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all as read
router.post('/read-all', auth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.userId,
        read: false
      },
      data: { read: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.notification.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
