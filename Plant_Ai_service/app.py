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

# Recommendations 
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
        print(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend")
async def get_recommendation(data: dict):
    """
    Get farming recommendations based on location, crop, growth stage, and season
    """
    try:
        location = data.get('location')
        crop = data.get('crop')
        growth_stage = data.get('growth_stage')
        season = data.get('season')
        
        # Your recommendation logic here
        recommendations = {
            "Pepper": {
                "Flowering": "Apply potassium-rich fertilizer. Maintain consistent watering.",
                "Vegetative": "Nitrogen-heavy fertilizer. Prune lower leaves.",
                "Fruiting": "Increase potassium. Support heavy branches."
            },
            "Tomato": {
                "Flowering": "Calcium supplement to prevent blossom end rot.",
                "Vegetative": "Stake plants. Apply balanced fertilizer.",
                "Fruiting": "Reduce nitrogen. Increase phosphorus and potassium."
            },
            "Corn": {
                "Vegetative": "Side-dress with nitrogen. Ensure adequate water.",
                "Flowering": "Maintain soil moisture. Watch for pests.",
                "Fruiting": "Continue watering. Harvest when kernels are plump."
            }
        }
        
        crop_rec = recommendations.get(crop, {}).get(growth_stage, 
            f"For {crop} in {growth_stage} stage during {season}, maintain regular watering and monitor for common pests."
        )
        
        return {
            "recommendation": crop_rec,
            "location": location,
            "crop": crop,
            "growth_stage": growth_stage,
            "season": season
        }
        
    except Exception as e:
        print(f"Recommendation error: {str(e)}")
        return {"recommendation": "Regular monitoring recommended. Consult local agricultural expert for specific advice."}
# Severity prediction based on disease + confidence + leaf coverage estimation
def predict_severity(disease, confidence, leaf_coverage_percentage=30):
    """
    Simple rule-based severity model
    """
    severity_rules = {
        "Healthy": {
            "level": "None",
            "score": 0,
            "color": "#4CAF50",
            "action": "No action needed"
        },
        "Powdery": {
            "Mild": {"coverage": [0, 30], "score": 1, "color": "#FFC107", "action": "Monitor weekly"},
            "Moderate": {"coverage": [31, 60], "score": 2, "color": "#FF9800", "action": "Apply neem oil"},
            "Severe": {"coverage": [61, 100], "score": 3, "color": "#F44336", "action": "Immediate fungicide"}
        },
        "Rust": {
            "Mild": {"coverage": [0, 20], "score": 1, "color": "#FFC107", "action": "Remove infected leaves"},
            "Moderate": {"coverage": [21, 50], "score": 2, "color": "#FF9800", "action": "Apply copper fungicide"},
            "Severe": {"coverage": [51, 100], "score": 3, "color": "#F44336", "action": "Isolate and treat urgently"}
        }
    }
    
    if disease == "Healthy":
        return severity_rules["Healthy"]
    
    # Determine severity based on coverage (you can extract from image)
    if leaf_coverage_percentage <= 30:
        severity = "Mild"
    elif leaf_coverage_percentage <= 60:
        severity = "Moderate"
    else:
        severity = "Severe"
    
    result = severity_rules[disease].get(severity, severity_rules[disease]["Mild"])
    result["severity"] = severity
    result["coverage_percentage"] = leaf_coverage_percentage
    result["confidence"] = confidence
    
    return result

# Add severity endpoint
@app.post("/severity")
async def get_severity(data: dict):
    disease = data.get('disease')
    confidence = data.get('confidence', 0.9)
    coverage = data.get('coverage_percentage', 30)  # Default 30%
    
    severity = predict_severity(disease, confidence, coverage)
    return severity


if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting Plant Disease Recognition API...")
    print(f"📊 Classes: {class_names}")
    print(f"📍 Server running at: http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)