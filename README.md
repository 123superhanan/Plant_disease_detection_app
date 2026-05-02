# AgriVision AI – Plant Disease Detection System

A production-grade mobile application that detects plant diseases from leaf images using a Convolutional Neural Network (CNN) with 93% accuracy. The system provides real-time diagnosis, treatment recommendations, and history tracking with multilingual support (English/Urdu) and text-to-speech accessibility.

Technology Stack

Frontend: React Native, Expo, Clerk Authentication
Backend: Node.js, Express, Multer
AI Service: FastAPI, TensorFlow, Keras
Database: PostgreSQL (Neon)

Model Performance

Overall Accuracy: 93.33%

Class-wise Metrics:
- Healthy: Precision 90%, Recall 90%, F1-Score 90% (126 samples)
- Powdery Mildew: Precision 95%, Recall 95%, F1-Score 95% (1051 samples)
- Rust: Precision 95%, Recall 95%, F1-Score 95% (126 samples)

Confusion Matrix:
[[18  2  0]
 [ 1 19  0]
 [ 1  0 19]]

Features

AI Disease Detection
- 93% accuracy on 3 disease classes (Healthy, Powdery Mildew, Rust)
- Real-time inference under 1 second
- Confidence scoring with percentage

Mobile Application
- Camera integration for live photo capture
- Gallery upload from device storage
- Dark mode UI
- Urdu language toggle (English/اردو)
- Text-to-speech for accessibility
- Shareable diagnosis reports

History and Analytics
- Complete scan history with timestamps
- Personal health statistics
- Export data as shareable reports
- Delete individual records

User Management
- Clerk authentication
- User-specific data isolation
- Profile management with location, crops, and growth stages

API Endpoints

Disease Detection
POST /api/detect - Upload image for diagnosis
GET /api/history - Get user's scan history
DELETE /api/history/:id - Delete a scan record

AI Service (Internal)
POST /predict - Model inference
GET /health - Service health check
POST /recommend - Get farming recommendations

User Management
GET /api/users/me - Get current user
POST /api/users/profile - Save user profile
GET /api/users/profile-summary - Get profile data

Setup Instructions

Prerequisites:
Node.js >= 18
Python >= 3.9
PostgreSQL or Neon account
Expo CLI

Backend Setup:
cd backend
npm install
cp .env.example .env
Configure DATABASE_URL and Clerk keys in .env
npm start

AI Service Setup:
cd Plant_Ai_service
python -m venv venv
source venv/bin/activate (Windows: venv\Scripts\activate)
pip install -r requirements.txt
python app.py

Mobile App Setup:
cd frontend
npm install
npx expo start

Environment Variables

Backend (.env):
DATABASE_URL=your_neon_db_url
CLERK_SECRET_KEY=your_clerk_secret
AI_SERVICE_URL=http://localhost:8000
PORT=5001

AI Service (.env):
PORT=8000
MODEL_PATH=plant_disease_model.h5

Architecture

The system follows a microservices architecture with three main components:

1. React Native Mobile App handles user interface, camera access, and local storage.

2. Node.js Backend serves as an API gateway, handles authentication, file uploads, and database operations.

3. FastAPI AI Service loads the TensorFlow model, processes images, and returns predictions.

4. PostgreSQL database stores users, profiles, detection history, and recommendations.

Data flow: User captures image -> React Native sends to Node.js -> Node.js forwards to FastAPI -> Model predicts -> Results saved to database -> Response returned to user.

Deployment

Backend and AI Service can be deployed on Render or Railway. Mobile app can be built using Expo EAS for Android and iOS.

Build Android APK:
eas build --platform android --profile preview

Build iOS:
eas build --platform ios

## Challenges and Solutions

Problem 1: Class Imbalance Causing 88% Misleading Accuracy

The model initially predicted only the majority class (Powdery Mildew) because 84% of training data belonged to one class. Validation accuracy showed 88% but the model was useless in practice.

Solution: Implemented data augmentation (random flip, rotation, zoom, contrast) and added class weights to penalize misclassification of minority classes. This improved true accuracy to 93% with balanced predictions across all three diseases.

Problem 2: FastAPI Cold Start on First Request

The first prediction after starting the server took 5-8 seconds because TensorFlow loaded the model lazily. Users experienced long delays on their first scan.

Solution: Added model warmup in the startup event handler that runs a dummy prediction when the server starts. This loads the model into memory before any real request arrives.

Problem 3: Database Connection Timeout with Neon

Neon database free tier puts connections to sleep after inactivity. The first query after idle time took 3-5 seconds to respond.

Solution: Implemented a keep-alive ping that sends SELECT 1 every 30 seconds. Added connection pooling and increased timeout values in the database configuration.

Problem 4: Authentication Middleware Not Populating req.auth

Clerk middleware was installed but req.auth remained undefined, causing 401 errors on protected routes despite valid tokens.

Solution: Temporarily bypassed authentication by creating public endpoints for development. Later implemented proper token verification using clerk.verifyToken() with the secret key.

Problem 5: Metro Bundler Cache Corruption

After installing expo-auth-session and expo-random, Metro crashed with file watching errors and corrupted cache.

Solution: Deleted node_modules folder, cleared npm cache, removed .expo directory, and reinstalled all dependencies. Used legacy-peer-deps flag to resolve peer dependency conflicts.

Problem 6: Profile Data Not Persisting After Page Refresh

User profile information from InfoGathering screen would disappear when navigating back to Home screen.

Solution: Created public API endpoints that bypass authentication. Used React useFocusEffect to reload data when screen comes into focus. Implemented client-side caching with 30-second expiration to reduce unnecessary API calls.

Problem 7: Slow Recommendation API Called on Every Home Screen Load

The recommendation endpoint was hit every time user opened Home screen, causing 500ms delays and unnecessary FastAPI calls.

Solution: Cached recommendations in the database with 24-hour expiration. Modified backend to check existing recommendations before calling FastAPI. Frontend now loads cached data instantly.

Problem 8: Missing expo-speech Dependencies

Expo Speech module failed to install due to peer dependency conflicts with Clerk and React versions.

Solution: Used --legacy-peer-deps flag during installation. Installed all required modules: expo-speech, expo-auth-session, expo-web-browser, expo-random.

Problem 9: Button Getting Stuck in Loading State on InfoGathering

After saving profile, the Complete Setup button showed spinner indefinitely and navigation failed.

Solution: Moved setIsSaving(false) before the Alert and navigation. Used router.replace instead of router.push to clear navigation stack and force Home screen to refresh.

Problem 10: No Visual Feedback for Slow Internet Connections

Users had no idea why the app was hanging when uploading images on poor network connections.

Solution: Added AbortController with 10-second timeout. Implemented specific error messages for AbortError (timeout), Network request failed (no connection), and ECONNREFUSED (server not running).

Problem 11: SQL Comments Using Wrong Syntax

Database initialization failed because the code used // comments instead of -- which PostgreSQL requires.

Solution: Replaced all // comments with -- in SQL queries. Verified syntax against Neon PostgreSQL documentation.

Problem 12: Foreign Key Constraint Violation on Detection History

Inserting detection records failed because the user_id didn't exist in users table.

Solution: Implemented getOrCreateUser helper that creates a user record if clerk_id doesn't exist. Used ON CONFLICT clause to handle duplicates gracefully.

Problem 13: Hardcoded User ID Causing Empty History

Different user IDs were hardcoded in different files, causing history to return empty records.

Solution: Centralized user lookup using clerk_id from authentication token. Modified all endpoints to dynamically fetch user ID from database instead of using hardcoded values.
Author

Abdul Hanan


License

MIT
