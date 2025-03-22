# Youtinerary: AI-Powered Itinerary Planner

This project is an API-based itinerary planner that generates and stores travel itineraries using AI. It uses Express.js for the backend, Firebase for storing itineraries, and OpenAI for generating the itineraries based on user input.

## Features

- **Generate Itinerary**: Automatically generates a travel itinerary based on user input (start date, end date, group type, pace, interests, budget, and destinations).
- **Store Itinerary**: Stores generated itineraries into Firebase Firestore.
- **View Itinerary**: Retrieve and view a stored itinerary.
- **Modify Itinerary**: Move or delete destinations from the itinerary.
- **Delete Itinerary**: Delete the entire itinerary and its associated data from Firestore.

## Prerequisites

Make sure you have the following installed:

- Node.js
- Firebase project
- OpenAI API key

## Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/itinerary-planner.git
    cd itinerary-planner
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up your Firebase project:
    - Go to [Firebase Console](https://console.firebase.google.com/).
    - Create a new Firebase project.
    - Add Firebase SDK configuration to `.env` file:

    ```bash
    FIREBASE_API_KEY=<your-api-key>
    FIREBASE_AUTH_DOMAIN=<your-auth-domain>
    FIREBASE_PROJECT_ID=<your-project-id>
    FIREBASE_STORAGE_BUCKET=<your-storage-bucket>
    FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
    FIREBASE_APP_ID=<your-app-id>
    FIREBASE_MEASUREMENT_ID=<your-measurement-id>
    ```

4. Set up OpenAI API key:
    - Obtain an API key from [OpenAI](https://beta.openai.com/signup/).
    - Add the key to the `.env` file:

    ```bash
    OPENAI_API_KEY=<your-openai-api-key>
    ```

5. Run the server:

    ```bash
    npm start
    ```

    This will start the server at `http://localhost:2200`.
