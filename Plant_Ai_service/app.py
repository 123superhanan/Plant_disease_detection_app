from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
import uuid
from datetime import datetime
import os

app = FastAPI(title="Plant Disease Recognition API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
print("Loading model...")
MODEL_PATH = "plant_disease_model.h5"

if not os.path.exists(MODEL_PATH):
    print(f"❌ Model file {MODEL_PATH} not found!")
    exit(1)

model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Model loaded successfully!")

# Load or create class names
CLASS_NAMES_PATH = "class_names.json"

if os.path.exists(CLASS_NAMES_PATH):
    try:
        with open(CLASS_NAMES_PATH, 'r') as f:
            class_names = json.load(f)
        print(f"✅ Loaded class names: {class_names}")
    except:
        class_names = ['Healthy', 'Powdery', 'Rust']
        with open(CLASS_NAMES_PATH, 'w') as f:
            json.dump(class_names, f)
        print(f"✅ Created class names: {class_names}")
else:
    class_names = ['Healthy', 'Powdery', 'Rust']
    with open(CLASS_NAMES_PATH, 'w') as f:
        json.dump(class_names, f)
    print(f"✅ Created class names: {class_names}")

IMG_SIZE = (128, 128)

# Recommendations (same as before)
RECOMMENDATIONS = {
    "Healthy": {
        "disease_name": "Healthy Plant",
        "treatment": "No treatment needed. Continue good care.",
        "prevention": "Regular watering, proper sunlight, clean tools",
        "severity": "None"
    },
    "Powdery": {
        "disease_name": "Powdery Mildew",
        "treatment": "Apply fungicide or neem oil. Remove infected leaves.",
        "prevention": "Improve air circulation, avoid overhead watering",
        "severity": "Moderate"
    },
    "Rust": {
        "disease_name": "Leaf Rust",
        "treatment": "Remove infected leaves, apply copper fungicide",
        "prevention": "Keep leaves dry, space plants properly",
        "severity": "Moderate to Severe"
    }
}

def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert('RGB')
    image = image.resize(IMG_SIZE)
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

@app.get("/")
def root():
    return {"message": "🌱 Plant Disease Recognition API", "classes": class_names}

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": True}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        processed_image = preprocess_image(image_bytes)
        
        predictions = model.predict(processed_image)
        predicted_class_idx = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]))
        
        predicted_class = class_names[predicted_class_idx]
        recommendation = RECOMMENDATIONS.get(predicted_class, RECOMMENDATIONS["Healthy"])
        
        return {
            "success": True,
            "prediction_id": str(uuid.uuid4()),
            "disease": predicted_class,
            "confidence": confidence,
            "confidence_percentage": f"{confidence:.1%}",
            "recommendations": recommendation
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting Plant Disease Recognition API...")
    print(f"📊 Classes: {class_names}")
    print(f"📍 Server running at: http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)