# YOUtinerary

A local, AI-assisted travel planning application. The **backend** uses Node.js + Express, while the **frontend** is built with React (Vite). This app integrates with Firebase, OpenAI, and Google Maps for itinerary generation, user data storage, and interactive maps.

## Table of Contents

1. [Overview](#overview)  
2. [Project Structure](#project-structure)  
3. [Installation](#installation)  
4. [Environment Variables](#environment-variables)  
5. [Running Locally](#running-locally)  
6. [Scripts Reference](#scripts-reference)  
7. [License](#license)

---

## Overview

- **AI-Powered**: Generates travel itineraries based on user preferences via OpenAI.  
- **Firebase**: Stores user data and itineraries in Firestore.  
- **Google Maps**: Renders trip destinations on a dynamic map with markers.  
- **Drag & Drop**: Reorder destinations within each itinerary (if you own it).  
- **Responsive UI**: Built with React, Vite, and MUI for fast development.

---

## Project Structure

youtinerary/\
├── backend/\
│   ├── index.js\
│   ├── package.json\
│   ├── openaiService.js\
│   └── ...\
├── frontend/\
│   ├── src/\
│   │   ├── pages/\
│   │   ├── components/\
│   │   └── ...\
│   ├── package.json\
│   └── vite.config.js\
└── README.md\

- **backend/**: Node.js + Express server. You run it with `node index.js`.  
- **frontend/**: React + Vite app. Run with `npm run dev` inside the `frontend` folder.

---

## Installation

1. **Clone the repo** (if you haven’t already):
   ```bash
   git clone https://github.com/YourUsername/youtinerary.git
   cd youtinerary
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```
   This includes express, firebase, openai, etc.
   
3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```
   This includes react, @mui/material, vite, etc.

## Environment Variables
You’ll need environment variables for OpenAI, Firebase, Google Maps, etc.

**Backend:** backend/.env
```text
OPENAI_API_KEY=sk-...
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
GOOGLE_MAPS_API_KEY=...
```
(Adjust naming to match your code.)

**Frontend:** frontend/.env or frontend/.env.local
```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_GOOGLE_MAPS_API=...
```
(All variables must start with VITE_ to be accessible in a Vite-based app.)


## Running Locally
**Backend:**
```bash
cd backend
node index.js
```
By default, the server might run on http://localhost:2200 (or whichever port is specified in index.js).

**Frontend:**
```bash
cd ../frontend
npm run dev
```
Vite typically runs on http://localhost:5173.

Open your browser to the frontend URL (e.g., http://localhost:5173). The frontend will make API calls to the backend.

That’s it! Now you can run the backend locally with node index.js and the frontend with npm run dev.

   
