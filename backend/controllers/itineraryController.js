// controllers/itineraryController.js
const db = require('../config/firebase');
const { doc, setDoc, getDoc, getDocs, collection, deleteDoc, query, where } = require('firebase/firestore');
const { generateItinerary } = require('../services/openaiService');

exports.createItinerary = async (req, res) => {
    try {
        const { tripId, startDate, endDate, userId, preferences, tripName, days } = req.body;
        const createdAt = new Date().toISOString();

        // Create itinerary document
        await setDoc(doc(db, "itineraries", tripId), {
            startDate,
            endDate,
            userId,
            tripName,
            createdAt
        });

        // Add preferences as a sub-collection
        const preferencesRef = doc(db, `itineraries/${tripId}/preferences`, "preferences");
        await setDoc(preferencesRef, preferences);

        // Add days and destinations
        for (const day of days) {
            const dayRef = doc(db, `itineraries/${tripId}/days`, day.dayId.toString());
            await setDoc(dayRef, { dayId: day.dayId });

            for (const destination of day.destinations) {
                const destRef = doc(db, `itineraries/${tripId}/days/${day.dayId}/destinations`, destination.name);
                await setDoc(destRef, {
                    name: destination.name,
                    latitude: destination.latitude,
                    longitude: destination.longitude,
                    startTime: destination.startTime,
                    endTime: destination.endTime
                });
            }
        }

        return res.status(201).send({ message: "Itinerary created successfully", tripId });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};

exports.generateItinerary = async (req, res) => {
    const { startDate, endDate, group, pace, interests, budget, destinations } = req.body;

    const prompt = `
        Generate an itinerary from ${startDate} to ${endDate} 
        for a ${group} with a ${pace} pace.
        Interests: ${interests.join(', ')}.
        Budget: ${budget}.
        Destinations: ${destinations.join(', ')}.
        Format as a json (excluding carriage return):
        {
            "itinerary": {
                "preferences": {
                    "pace": "<input>",
                    "budget": "<input>",
                    "group": "<input>",
                    "interests": ["<input1>", "<input2>", ..."]
            },
            "days": [
                {
                    "dayNumber": <output>,
                    "date": "<output>",
                    "destinations": [
                        {
                            "name": "<output>",
                            "longitude": "<output>",
                            "latitude": "<output>"
                        }
                    ]
                },
                {
                    "dayNumber": <output>,
                    "date": "<output>",
                    "destinations": [
                        {
                            "name": "<output>",
                            "longitude": "<output>",
                            "latitude": "<output>"
                        }
                    ]
                },
            }
        }
    `;

    try {
        const itinerary = await generateItinerary(prompt);
        res.json({ itinerary });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Could not generate itinerary' });
    }
};


exports.deleteDestination = async (req, res) => {
    try {
        const { id: tripId, dayId, destName } = req.params;

        // Check if the itinerary exists
        const itineraryRef = doc(db, "itineraries", tripId);
        const itinerarySnap = await getDoc(itineraryRef);

        if (!itinerarySnap.exists()) {
            return res.status(404).send({ message: "Itinerary not found" });
        }

        // Check if the day exists
        const dayRef = doc(db, `itineraries/${tripId}/days`, dayId);
        const daySnap = await getDoc(dayRef);

        if (!daySnap.exists()) {
            return res.status(404).send({ message: "Day not found" });
        }

        // Delete the destination from the day
        const destRef = doc(db, `itineraries/${tripId}/days/${dayId}/destinations`, destName);
        await deleteDoc(destRef);

        return res.status(200).send({ message: "Destination deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};

exports.deleteItinerary = async (req, res) => {
    try {
        const { id: tripId } = req.params;

        // Check if the itinerary exists
        const itineraryRef = doc(db, "itineraries", tripId);
        const itinerarySnap = await getDoc(itineraryRef);

        if (!itinerarySnap.exists()) {
            return res.status(404).send({ message: "Itinerary not found" });
        }

        // Fetch all days subcollection
        const daysRef = collection(db, `itineraries/${tripId}/days`);
        const daysSnap = await getDocs(daysRef);

        // Delete all destinations for each day
        for (const dayDoc of daysSnap.docs) {
            const dayDestinationsRef = collection(db, `itineraries/${tripId}/days/${dayDoc.id}/destinations`);
            const destinationsSnap = await getDocs(dayDestinationsRef);

            // Delete all destinations under the day
            for (const destDoc of destinationsSnap.docs) {
                await deleteDoc(destDoc.ref);
            }

            // Delete the day document
            await deleteDoc(dayDoc.ref);
        }

        // Finally, delete the itinerary document
        await deleteDoc(itineraryRef);

        return res.status(200).send({ message: "Itinerary and all associated data deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};

exports.moveDestination = async (req, res) => {
    try {
        const { id: tripId } = req.params; // Itinerary ID
        const { sourceDayId, targetDayId, destName } = req.body; // Source day ID, target day ID, and destination name

        if (!sourceDayId || !targetDayId || !destName) {
            return res.status(400).send({ message: "Missing required parameters" });
        }

        // Fetch the itinerary document
        const itineraryRef = doc(db, "itineraries", tripId);
        const itinerarySnap = await getDoc(itineraryRef);
        if (!itinerarySnap.exists()) {
            return res.status(404).send({ message: "Itinerary not found" });
        }

        // Fetch source day document
        const sourceDayRef = doc(db, `itineraries/${tripId}/days`, sourceDayId.toString());
        const sourceDaySnap = await getDoc(sourceDayRef);
        if (!sourceDaySnap.exists()) {
            return res.status(404).send({ message: "Source day not found" });
        }

        // Fetch target day document
        const targetDayRef = doc(db, `itineraries/${tripId}/days`, targetDayId.toString());
        const targetDaySnap = await getDoc(targetDayRef);
        if (!targetDaySnap.exists()) {
            return res.status(404).send({ message: "Target day not found" });
        }

        // Fetch the destination from the source day
        const sourceDestRef = doc(db, `itineraries/${tripId}/days/${sourceDayId}/destinations`, destName);
        const sourceDestSnap = await getDoc(sourceDestRef);
        if (!sourceDestSnap.exists()) {
            return res.status(404).send({ message: "Destination not found in source day" });
        }

        // Fetch target day destinations sub-collection
        const targetDestRef = doc(db, `itineraries/${tripId}/days/${targetDayId}/destinations`, destName);

        // Check if destination already exists in target day
        const targetDestSnap = await getDoc(targetDestRef);
        if (targetDestSnap.exists()) {
            return res.status(400).send({ message: "Destination already exists in target day" });
        }

        // Move the destination: delete from source day and add to target day
        const destinationData = sourceDestSnap.data();

        // Remove the destination from source day
        await deleteDoc(sourceDestRef);

        // Add the destination to target day
        await setDoc(targetDestRef, destinationData);

        return res.status(200).send({ message: "Destination moved successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};

exports.viewItinerary = async (req, res) => {
    try {
        const tripId = req.params.id;

        // Fetch itinerary document
        const itineraryRef = doc(db, "itineraries", tripId);
        const itinerarySnap = await getDoc(itineraryRef);

        if (!itinerarySnap.exists()) {
            return res.status(404).send({ message: "Itinerary not found" });
        }

        let itineraryData = itinerarySnap.data();
        itineraryData.days = [];

        // Fetch days subcollection
        const daysRef = collection(db, `itineraries/${tripId}/days`);
        const daysSnap = await getDocs(daysRef);

        for (const dayDoc of daysSnap.docs) {
            let dayData = { dayId: dayDoc.id, destinations: [] };

            // Fetch destinations subcollection
            const destinationsRef = collection(db, `itineraries/${tripId}/days/${dayDoc.id}/destinations`);
            const destinationsSnap = await getDocs(destinationsRef);

            for (const destDoc of destinationsSnap.docs) {
                dayData.destinations.push(destDoc.data());
            }

            itineraryData.days.push(dayData);
        }

        return res.status(200).send(itineraryData);

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};

exports.getAllItineraries = async (req, res) => {
    try {
        const itinerariesRef = collection(db, "itineraries");
        const itinerariesSnap = await getDocs(itinerariesRef);

        if (itinerariesSnap.empty) {
            return res.status(404).send({ message: "No itineraries found" });
        }

        const itineraries = [];
        itinerariesSnap.forEach(doc => {
            itineraries.push({ tripId: doc.id, ...doc.data() });
        });

        return res.status(200).send(itineraries);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};

exports.getUserItinerary = async (req, res) => {
    try {
        const { userId } = req.params;
        const itinerariesRef = collection(db, "itineraries");
        const q = query(itinerariesRef, where("userId", "==", userId)); // Query to filter by userId
        const itinerariesSnap = await getDocs(q);

        if (itinerariesSnap.empty) {
            return res.status(404).send({ message: `No itineraries found for user ${userId}` });
        }

        const itineraries = [];
        itinerariesSnap.forEach(doc => {
            itineraries.push({ tripId: doc.id, ...doc.data() });
        });

        return res.status(200).send(itineraries);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
}