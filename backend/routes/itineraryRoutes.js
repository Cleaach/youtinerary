// routes/itineraryRoutes.js
const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');

router.post('/createItinerary', itineraryController.createItinerary);
router.post('/generateItinerary', itineraryController.generateItinerary);
router.get('/view/:id', itineraryController.viewItinerary);
router.delete('/view/:id', itineraryController.deleteItinerary);
router.delete('/view/:id/:dayId/:destName', itineraryController.deleteDestination);
router.put('/view/:id/move-destination', itineraryController.moveDestination);
router.get('/view/user/:userId', itineraryController.getUserItinerary);
router.get('/view', itineraryController.getAllItineraries);

module.exports = router;
