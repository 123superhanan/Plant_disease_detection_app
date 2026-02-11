```
# AgroVision  
AI-Based Plant Disease Detection System  

Final Year Project – AIR University Islamabad  

Group Members:  
- Abdul Hanan Abbasi (240560)  
- M Sameer Khalid (240556)  
- Muhammad Humza (243443)  

## Project Overview  
AgroVision is a mobile application that helps farmers detect plant diseases early.  
Users upload a leaf photo. The app analyzes it with AI and shows:  
- Plant name  
- Disease name  
- Severity level  
- Confidence score  
- Treatment recommendations  
- Basic crop loss estimate  

The goal is to reduce yield losses for small-scale farmers in Pakistan.

## Current Status  
This is the planning and proposal phase (SRS document).  
Development is in progress.  
Core features planned:  
- User registration and login  
- Image upload and on-device AI analysis (TensorFlow.js)  
- Detection history  
- Personalized onboarding (crops, location, farm size)  
- Admin dashboard for validation and charts  
- Notifications  

## Key Features (Planned)  
- On-device AI inference (no server needed for detection)  
- Personalized results based on user crops and location  
- Offline support for cached data  
- Simple farmer-friendly UI  

## Tech Stack  
Frontend: React Native  
AI: TensorFlow.js  
Backend: Firebase (Auth, Firestore, Storage, Notifications)  
Training: Python + TensorFlow/Keras  
Dataset: PlantVillage (~54,000 labeled plant images)  
UI Design: Figma  
Charts: Chart.js  

## Project Structure (so far)  
- SRS document (proposal, problem statement, objectives, modules, scope, limitations, tools, work division, Gantt chart, mockups, flow chart, references)  
- Mockups (upload screen, result screen, history view)  
- Flow chart (user journey from login to result)  

## Installation (Development Setup)  
1. Clone the repo (when ready)  
2. Install dependencies  
   ```
   npm install
   ```  
3. Run the app  
   ```
   npx expo start
   ```  

## Future Work  
- Finish AI model training and conversion to TensorFlow.js  
- Implement onboarding screens  
- Add personalized recommendations  
- Build admin web dashboard  
- Test with real farmer photos  

## License  
This is a student project. All rights reserved.  

Made for AIR University FYP 2025–2026

Tech Stack
Frontend: React Native.
AI: TensorFlow.js.
Backend: Firebase.
Training: Python, TensorFlow, Keras.
Dataset: PlantVillage.
UI Design: Figma.
Charts: Chart.js.
Installation Commands
Set up the environment.

For React Native app:
textnpx create-expo-app AgroVision  
cd AgroVision  
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native expo-camera react-native-onboarding-swiper @react-native-async-storage/async-storage expo-notifications firebase chart.js  
npx expo start
```
For AI training in Python:
textconda create -n agrovision python=3.11  
conda activate agrovision  
pip install tensorflow keras numpy pandas matplotlib opencv-python scikit-learn  
pip install tensorflowjs
