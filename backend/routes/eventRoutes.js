const express = require('express');
const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);
router.post('/create', eventController.createEvent);
router.get('/getAllEvents', eventController.getAllEvents);
router.get('/getMyEvents', eventController.getMyEvents);
router.get('/getDeletedEvents', eventController.getDeletedEvents);
router.get('/getJoinedEvents', eventController.getJoinedEvents);
router.get('/:id', eventController.getEvent);
router.patch('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.post('/:id/join', eventController.joinEvent);
router.post('/:id/leave', eventController.leaveEvent);

module.exports = router;
