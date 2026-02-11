---

# AgroVision

AI-Based Plant Disease Detection System

Final Year Project – AIR University Islamabad

Team:

* Abdul Hanan Abbasi (240560)
* M Sameer Khalid (240556)
* Muhammad Humza (243443)

---

## Overview

AgroVision helps farmers detect plant diseases early using AI.
Users upload a leaf photo; the app analyzes it and returns:

- Plant name
- Disease name
- Severity level
- Confidence score
- Treatment guidance
- Estimated crop loss

Goal: Reduce crop yield losses for small-scale farmers in Pakistan.

---

## System Architecture

**Mobile App:** React Native (Expo)
**AI Inference:** TensorFlow.js (on-device)
**AI Training:** Python, TensorFlow, Keras
**Backend:** Firebase + Clerk + Neon PostgreSQL
**Admin Dashboard:** Web (analytics and validation)

---

## Core Modules

1. Authentication (Clerk, Firebase Auth)
2. User Onboarding (crops, location, farm size)
3. Image Detection (camera/upload + TensorFlow.js)
4. Detection History (stored in Firestore or Neon DB)
5. Personalized Recommendations
6. Notifications (seasonal/disease alerts)
7. Admin Dashboard (analytics, validation, charts)

---

## Backend Responsibilities

- User authentication via Clerk
- Store user profiles and onboarding data
- Store detection logs in Neon DB
- Provide transaction/analytics endpoints
- Rate limiting with Express middleware
- Push notifications via Firebase
- Role-based admin access
- Aggregated data for charts

**Example table: transactions**

| Column     | Type          | Notes                                     |
| ---------- | ------------- | ----------------------------------------- |
| id         | SERIAL        | Primary key                               |
| user_id    | VARCHAR(255)  | User identifier                           |
| title      | VARCHAR(255)  | Transaction title                         |
| amount     | DECIMAL(10,2) | Positive for income, negative for expense |
| categories | VARCHAR(255)  | Type/category                             |
| created_at | DATE          | Defaults to current date                  |

---

## Dataset

- PlantVillage (~54,000 labeled plant images)
- Multiple crops and disease classes

---

## Tech Stack

- Frontend: React Native, Expo
- AI: TensorFlow.js
- Backend: Firebase Auth, Firestore, Neon PostgreSQL, Clerk
- Model Training: Python, TensorFlow, Keras, OpenCV
- UI: Figma
- Charts: Chart.js

---

## Development Setup

### 1. Frontend (React Native App)

```bash
npx create-expo-app AgroVision
cd AgroVision
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native expo-camera react-native-onboarding-swiper @react-native-async-storage/async-storage expo-notifications firebase chart.js
npx expo start
```

### 2. Backend (Node.js + Express + Neon + Clerk + Rate Limiter)

```bash
cd backend
npm init -y
npm install express dotenv @neondatabase/serverless pg @clerk/clerk-sdk-node express-rate-limit
```

**Run server**

```bash
node index.js
```

**Environment Variables (.env)**

```
PORT=5001
DATABASE_URL=your_neon_database_url
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 3. AI Training Environment (Python)

```bash
conda create -n agrovision python=3.11
conda activate agrovision
pip install tensorflow keras numpy pandas matplotlib opencv-python scikit-learn tensorflowjs
```

---

## API Endpoints

| Method | Endpoint                          | Description                     |
| ------ | --------------------------------- | ------------------------------- |
| POST   | /api/transaction                  | Create a transaction            |
| GET    | /api/transaction/:userId          | Get all transactions for a user |
| DELETE | /api/transaction/:id              | Delete a transaction by ID      |
| GET    | /api/transaction/summary/:user_id | Get balance, income, expenses   |

---

## Current Phase

- SRS completed
- Expo frontend setup completed
- Backend setup (Express + Neon + Clerk + Rate Limiter)
- AI model training in progress
- Mockups and flowcharts ready

---

## Future Improvements

- Finish AI model training and TensorFlow.js conversion
- Implement onboarding screens
- Personalized recommendations based on crops and location
- Admin web dashboard for analytics and validation
- Real farmer photo testing
- Crop yield prediction module
- Geolocation disease heatmaps

---

## License

Student project. All rights reserved.

---
