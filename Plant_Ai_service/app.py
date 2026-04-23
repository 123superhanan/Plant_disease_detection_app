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

app = FastAPI(title="Plant Disease Recognition API")

# Enable CORS for your React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your model and class names
print("Loading model...")
MODEL_PATH = "plant_disease_model.h5"
CLASS_NAMES_PATH = "class_names.json"

model = tf.keras.models.load_model(MODEL_PATH)
with open(CLASS_NAMES_PATH, 'r') as f:
    class_names = json.load(f)

print(f"✅ Model loaded! Classes: {class_names}")

# Image settings
IMG_SIZE = (128, 128)

# ============================================
# RECOMMENDATION SYSTEM (Complete)
# ============================================
RECOMMENDATIONS = {
    "Healthy": {
        "disease_name": "Healthy Plant",
        "description": "Your plant appears to be healthy with no visible diseases.",
        "treatment": "No treatment needed. Continue good plant care practices.",
        "prevention": [
            "Water plants at the base to keep leaves dry",
            "Ensure 6-8 hours of sunlight daily",
            "Maintain proper spacing between plants",
            "Use well-draining soil",
            "Clean garden tools regularly"
        ],
        "severity": "None",
        "urgency": "No action needed",
        "chemical_treatment": "Not required",
        "organic_treatment": "Continue regular maintenance",
        "symptoms": "No visible symptoms",
        "caused_by": "Healthy plant condition"
    },
    
    "Powdery": {
        "disease_name": "Powdery Mildew",
        "description": "Fungal disease that appears as white powdery spots on leaves, stems, and flowers.",
        "treatment": [
            "Remove severely infected leaves and destroy them",
            "Apply fungicide containing sulfur or potassium bicarbonate",
            "Spray with neem oil solution (2 tbsp per gallon of water)",
            "Use baking soda spray (1 tbsp baking soda + 1/2 tsp soap per gallon)"
        ],
        "prevention": [
            "Water plants early morning so leaves dry quickly",
            "Improve air circulation by proper spacing",
            "Avoid overhead watering",
            "Plant resistant varieties",
            "Apply preventive sulfur spray in humid conditions"
        ],
        "severity": "Moderate",
        "urgency": "Treat within 1-2 weeks",
        "chemical_treatment": "Sulfur, Myclobutanil, Propiconazole, Potassium bicarbonate",
        "organic_treatment": "Neem oil, Baking soda solution, Milk spray (1:10 ratio), Garlic spray",
        "symptoms": [
            "White or gray powdery spots on leaves",
            "Leaves turning yellow or brown",
            "Stunted growth",
            "Leaves curling or dropping"
        ],
        "caused_by": "Fungus (Erysiphales) - thrives in warm, dry conditions with high humidity"
    },
    
    "Rust": {
        "disease_name": "Leaf Rust",
        "description": "Fungal disease characterized by orange, yellow, or brown pustules on leaves.",
        "treatment": [
            "Remove and destroy infected leaves immediately",
            "Apply copper-based fungicide",
            "Spray with neem oil every 7-14 days",
            "Use sulfur dust during dry weather"
        ],
        "prevention": [
            "Water at soil level, not on leaves",
            "Ensure good air circulation",
            "Remove plant debris from garden",
            "Rotate crops yearly",
            "Plant rust-resistant varieties"
        ],
        "severity": "Severe if untreated",
        "urgency": "Treat within 1 week",
        "chemical_treatment": "Copper fungicide, Mancozeb, Azoxystrobin, Chlorothalonil",
        "organic_treatment": "Neem oil, Compost tea, Baking soda spray, Sulfur dust",
        "symptoms": [
            "Orange, yellow or brown pustules on leaf undersides",
            "Yellow spots on top of leaves",
            "Leaves turning brown and dying",
            "Premature leaf drop"
        ],
        "caused_by": "Fungus (Pucciniales) - spreads in wet, humid conditions"
    }
}

# ============================================
# HELPER FUNCTIONS
# ============================================
def preprocess_image(image_bytes):
    """Convert uploaded image to model input"""
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert('RGB')
    image = image.resize(IMG_SIZE)
    image_array = np.array(image) / 255.0  # Normalize
    image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
    return image_array

def get_recommendation(class_name, confidence):
    """Get detailed recommendation based on predicted disease"""
    base_recommendation = RECOMMENDATIONS.get(class_name, RECOMMENDATIONS["Healthy"])
    
    # Add confidence-based advice
    if confidence < 0.6:
        advice = "Low confidence prediction. Please upload a clearer image or consult an expert."
    elif confidence < 0.8:
        advice = "Moderate confidence. Monitor your plant and re-check in a few days."
    else:
        advice = "High confidence diagnosis. Follow treatment recommendations promptly."
    
    return {
        **base_recommendation,
        "confidence_level": f"{confidence:.1%}",
        "advice": advice,
        "timestamp": datetime.now().isoformat()
    }

# ============================================
# API ENDPOINTS
# ============================================
@app.get("/")
def root():
    return {
        "message": "🌱 Plant Disease Recognition API",
        "status": "running",
        "available_classes": class_names,
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": True}

@app.get("/classes")
def get_classes():
    """Get all available disease classes"""
    return {
        "classes": class_names,
        "recommendations_available": list(RECOMMENDATIONS.keys())
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Predict disease from uploaded image"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(400, "File must be an image")
        
        # Read and preprocess image
        image_bytes = await file.read()
        if len(image_bytes) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(400, "Image too large. Max 10MB")
        
        processed_image = preprocess_image(image_bytes)
        
        # Make prediction
        predictions = model.predict(processed_image)
        predicted_class_idx = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]))
        
        predicted_class = class_names[predicted_class_idx]
        
        # Get detailed recommendation
        recommendation = get_recommendation(predicted_class, confidence)
        
        # Get all class probabilities
        all_probabilities = {
            class_name: float(prob) 
            for class_name, prob in zip(class_names, predictions[0])
        }
        
        return {
            "success": True,
            "prediction_id": str(uuid.uuid4()),
            "disease": predicted_class,
            "confidence": confidence,
            "confidence_percentage": f"{confidence:.1%}",
            "recommendations": recommendation,
            "all_probabilities": all_probabilities,
            "image_processed": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(500, f"Prediction failed: {str(e)}")

@app.post("/batch-predict")
async def batch_predict(files: list[UploadFile] = File(...)):
    """Predict multiple images at once"""
    results = []
    for file in files[:5]:  # Limit to 5 images
        try:
            result = await predict(file)
            results.append(result)
        except Exception as e:
            results.append({"error": str(e), "filename": file.filename})
    return {"results": results}

# ============================================
# RUN THE APP
# ============================================
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Plant Disease Recognition API...")
    print(f"📊 Classes: {class_names}")
    print(f"📍 Server running at: http://0.0.0.0:8000")
    print(f"📖 API Docs: http://0.0.0.0:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)