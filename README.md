# AgroVision - AI Plant Disease Detection System

**Final Year Project – Air University Islamabad**  
**Team:** Abdul Hanan Abbasi (240560) | M Sameer Khalid (240556) | Muhammad Humza (243443)

![AgroVision Demo](https://via.placeholder.com/800x400?text=Add+Screenshots+Here)  


## Overview
AgroVision helps Pakistani farmers detect plant diseases early using mobile AI.  
User takes a leaf photo → App instantly shows:
- Plant name
- Disease name
- Severity level
- Confidence score
- Treatment guidance
- Estimated crop loss

**Goal:** Reduce crop losses for small farmers.

## Tech Stack
- **Mobile App:** React Native (Expo) + TensorFlow.js (on-device inference)
- **Backend:** Node.js + Express + Clerk Auth + Neon PostgreSQL + Firebase
- **AI Model:** Python, TensorFlow/Keras (training) + **PyTorch** (separate research repo)
- **Admin Dashboard:** React + Chart.js

**PyTorch Version:** Check [plant-disease-pytorch](https://github.com/123superhanan/plant-disease-pytorch)

## System Architecture
- React Native frontend with camera & history
- Node.js backend + Clerk authentication
- On-device TensorFlow.js inference
- Admin dashboard for dataset management & predictions

## Current Progress (April 2026)
- ✅ SRS + Figma mockups completed
- ✅ Expo app + camera integration done
- ✅ Backend (Express + Neon + Clerk + rate limiting)
- ✅ Model training in progress (PlantVillage 54k images)
- 🔄 TensorFlow.js conversion + admin dashboard

## Setup Instructions
(Keep your existing setup section – it’s good)

## Future Plans
- Full on-device PyTorch/TensorFlow.js model
- Farmer field testing
- Crop yield prediction module

---

**Built by hand from YouTube + documentation. No AI code generation.**

Student Project | All rights reserved.
