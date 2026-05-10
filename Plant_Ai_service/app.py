from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import cv2
from fastapi import File, UploadFile, HTTPException
import io
import json
import uuid
import os

app = FastAPI(title="🌱 Plant Disease & Flower Recognition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================== CONFIGURATION ======================
IMG_SIZE = (128, 128)



def validate_image_quality(img):
    if img.size[0] < 50 or img.size[1] < 50:
        return False, "Image too small. Please upload a clearer picture."
    if img.mode != 'RGB' and img.mode != 'RGBA':
        return False, "Please upload a color image."
    return True, "Valid image"

def detect_if_leaf(img):
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img_array = np.array(img)
    hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    lower_green = np.array([35, 40, 40])
    upper_green = np.array([85, 255, 255])
    green_mask = cv2.inRange(hsv, lower_green, upper_green)
    green_percentage = (np.sum(green_mask > 0) / green_mask.size) * 100
    
    if green_percentage < 10:
        return False, f"Image doesn't appear to be a plant leaf (only {green_percentage:.1f}% green area)"
    return True, f"Valid leaf detected ({green_percentage:.1f}% green area)"
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img_array = np.array(img)
    hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    lower_green = np.array([35, 40, 40])
    upper_green = np.array([85, 255, 255])
    green_mask = cv2.inRange(hsv, lower_green, upper_green)
    green_percentage = (np.sum(green_mask > 0) / green_mask.size) * 100
    
    if green_percentage < 10:
        return False, f"Image doesn't appear to be a plant leaf (only {green_percentage:.1f}% green area)"
    return True, f"Valid leaf detected ({green_percentage:.1f}% green area)"
def estimate_damage_percentage(img):
    """Estimate how much of the leaf is damaged"""
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    img_array = np.array(img)
    hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    
    # Brown spots (disease)
    lower_brown = np.array([10, 40, 40])
    upper_brown = np.array([25, 255, 255])
    brown_mask = cv2.inRange(hsv, lower_brown, upper_brown)
    brown_percentage = (np.sum(brown_mask > 0) / brown_mask.size) * 100
    
    # Yellow spots (early disease)
    lower_yellow = np.array([20, 40, 40])
    upper_yellow = np.array([35, 255, 255])
    yellow_mask = cv2.inRange(hsv, lower_yellow, upper_yellow)
    yellow_percentage = (np.sum(yellow_mask > 0) / yellow_mask.size) * 100
    
    total_damage = min(100, brown_percentage + yellow_percentage)
    
    if total_damage < 10:
        return "Mild", total_damage
    elif total_damage < 40:
        return "Moderate", total_damage
    else:
        return "Severe", total_damage
def load_model(model_path, model_name):
    if os.path.exists(model_path):
        try:
            model = tf.keras.models.load_model(model_path)
            print(f" {model_name} loaded successfully!")
            return model
        except Exception as e:
            print(f" Error loading {model_name}: {e}")
            return None
    else:
        print(f" {model_name} not found at {model_path}")
        return None

# Load Plant Disease Model
PLANT_MODEL_PATH = "plant_disease_model.h5"
plant_model = load_model(PLANT_MODEL_PATH, "Plant Disease Model")

# Load Flower Classifier Model
FLOWER_MODEL_PATH = "flower_classifier.h5"          # Change if .keras
flower_model = load_model(FLOWER_MODEL_PATH, "Flower Classifier Model")

# ====================== CLASS NAMES ======================
CLASS_NAMES_PATH = "class_names.json"
if os.path.exists(CLASS_NAMES_PATH):
    with open(CLASS_NAMES_PATH, 'r') as f:
        plant_class_names = json.load(f)
else:
    plant_class_names = ['Healthy', 'Powdery', 'Rust']
    with open(CLASS_NAMES_PATH, 'w') as f:
        json.dump(plant_class_names, f)

# Flower Classes - UPDATE THESE according to your flower model
FLOWER_CLASSES = ["Daisy", "Dandelion", "Rose", "Sunflower", "Tulip"]

# ====================== RECOMMENDATIONS ======================
RECOMMENDATIONS = {
    "Healthy": {
        "disease_name": "Healthy Plant",
        "symptoms": "No visible disease signs.",
        "treatment": "No treatment needed.",
        "prevention": "Continue regular watering, proper spacing, and balanced fertilizer.",
        "severity": "None"
    },
    "Powdery": {
        "disease_name": "Powdery Mildew",
        "symptoms": "White powdery spots on leaves, stems and sometimes fruits. Leaves may turn yellow and drop.",
        "treatment": "1. Remove infected leaves immediately.\n2. Spray neem oil or sulfur-based fungicide every 7 days.\n3. Apply potassium bicarbonate solution.",
        "prevention": "Improve air circulation, avoid overcrowding, water from base only, apply compost.",
        "severity": "Moderate"
    },
    "Rust": {
        "disease_name": "Leaf Rust",
        "symptoms": "Orange, brown or reddish pustules on underside of leaves. Leaves look burnt.",
        "treatment": "1. Remove and burn infected leaves.\n2. Apply copper or mancozeb fungicide.\n3. Spray every 5-7 days until controlled.",
        "prevention": "Keep leaves dry, proper plant spacing, resistant varieties, clean tools.",
        "severity": "Moderate to Severe"
    }
}
# function for flower model preprocessing (Grayscale)
def preprocess_image_flower(image_bytes):
    """Preprocess for flower model - expects grayscale"""
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert('RGB')  # First convert to RGB
    
    # Convert to grayscale (1 channel)
    image = image.convert('L')    # 'L' mode = grayscale, 1 channel
    
    # Resize
    image = image.resize(IMG_SIZE)  # (128, 128)
    
    # Convert to array and normalize
    image_array = np.array(image) / 255.0  # Shape: (128, 128, 1)
    
    # Add batch dimension
    return np.expand_dims(image_array, axis=0)  # Shape: (1, 128, 128, 1)

# ====================== HELPER FUNCTIONS ======================
def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert('RGB')
    image = image.resize(IMG_SIZE)
    image_array = np.array(image) / 255.0
    return np.expand_dims(image_array, axis=0)

# ====================== ENDPOINTS ======================
@app.get("/")
def root():
    return {
        "message": "🌱 Plant Disease & Flower Recognition API Running",
        "models": ["Plant Disease", "Flower Classification"]
    }


@app.post("/predict")
async def predict_plant_disease(file: UploadFile = File(...)):
    if not plant_model:
        raise HTTPException(500, "Plant Disease model not loaded")

    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(400, "Only image files allowed")

        image_bytes = await file.read()
        
        # ========== IMAGE VALIDATION ==========
        img = Image.open(io.BytesIO(image_bytes))
        
        # Quality check
        is_valid, quality_msg = validate_image_quality(img)
        if not is_valid:
            return {
                "success": False,
                "error": quality_msg,
                "error_type": "quality",
                "suggestion": "Please upload a clear, well-lit photo of a plant leaf"
            }
        
        # Leaf check (for plant disease detection)
        is_leaf, leaf_msg = detect_if_leaf(img)
        if not is_leaf:
            return {
                "success": False,
                "error": leaf_msg,
                "error_type": "leaf",
                "suggestion": "Please upload a photo of a plant leaf for accurate disease detection"
            }
        
        # Damage estimation
        severity_level, damage_percentage = estimate_damage_percentage(img)
        # ========== END VALIDATION ==========
        
        # ===== PREDICTION =====
        processed = preprocess_image(image_bytes)
        predictions = plant_model.predict(processed, verbose=0)
        idx = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]))

        disease = plant_class_names[idx]
        rec = RECOMMENDATIONS.get(disease, RECOMMENDATIONS["Healthy"])

        # Add damage info to response
        rec["damage_severity"] = severity_level
        rec["damage_percentage"] = round(damage_percentage, 1)

        return {
            "success": True,
            "type": "plant_disease",
            "prediction_id": str(uuid.uuid4()),
            "disease": disease,
            "confidence": round(confidence, 4),
            "confidence_percentage": f"{confidence:.1%}",
            "validation": {
                "quality_check": quality_msg,
                "leaf_check": leaf_msg,
                "damage_severity": severity_level,
                "damage_percentage": round(damage_percentage, 1)
            },
            "details": rec
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "error_type": "server",
            "suggestion": "Server error. Please try again."
        }
@app.post("/predict_flower")
async def predict_flower(file: UploadFile = File(...)):
    if not flower_model:
        raise HTTPException(500, "Flower classifier model not loaded")

    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(400, "Only image files allowed")

        image_bytes = await file.read()
        
        # Simple image validation for flowers
        img = Image.open(io.BytesIO(image_bytes))
        if img.size[0] < 50 or img.size[1] < 50:
            raise HTTPException(400, "Image too small. Please upload a clearer picture.")
        
        # ========== FIX: Use grayscale preprocessing ==========
        processed = preprocess_image_flower(image_bytes)  # Changed this line
        
        # Debug: Check input shape
        print(f"Input shape for flower model: {processed.shape}")
        
        predictions = flower_model.predict(processed, verbose=0)
        idx = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]))

        flower_name = FLOWER_CLASSES[idx] if idx < len(FLOWER_CLASSES) else "Unknown"

        return {
            "success": True,
            "type": "flower_classification",
            "prediction_id": str(uuid.uuid4()),
            "flower": flower_name,
            "confidence": round(confidence, 4),
            "confidence_percentage": f"{confidence:.1%}",
            "validation": {
                "image_accepted": True,
                "input_shape": "grayscale_128x128"
            },
            "all_classes": FLOWER_CLASSES
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Flower prediction error: {str(e)}")
        raise HTTPException(500, str(e))
    if not flower_model:
        raise HTTPException(500, "Flower classifier model not loaded")
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(400, "Only image files allowed")

        image_bytes = await file.read()
        
        # Simple image validation for flowers (no leaf check)
        img = Image.open(io.BytesIO(image_bytes))
        if img.size[0] < 50 or img.size[1] < 50:
            raise HTTPException(400, "Image too small. Please upload a clearer picture.")
        
        processed = preprocess_image(image_bytes)
        predictions = flower_model.predict(processed, verbose=0)
        idx = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]))

        flower_name = FLOWER_CLASSES[idx] if idx < len(FLOWER_CLASSES) else "Unknown"

        return {
            "success": True,
            "type": "flower_classification",
            "prediction_id": str(uuid.uuid4()),
            "flower": flower_name,
            "confidence": round(confidence, 4),
            "confidence_percentage": f"{confidence:.1%}",
            "validation": {
                "image_accepted": True
            },
            "all_classes": FLOWER_CLASSES
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
    
@app.get("/model-info")
async def get_model_info():
    """Get model input shape information"""
    info = {}
    
    if plant_model:
        plant_input_shape = plant_model.input_shape
        info["plant_disease"] = {
            "input_shape": plant_input_shape,
            "expected_channels": plant_input_shape[-1] if plant_input_shape else "unknown"
        }
    
    if flower_model:
        flower_input_shape = flower_model.input_shape
        info["flower_classifier"] = {
            "input_shape": flower_input_shape,
            "expected_channels": flower_input_shape[-1] if flower_input_shape else "unknown"
        }
    
    return info
@app.post("/detect-type")
async def detect_image_type(file: UploadFile = File(...)):
    """Detect if image is leaf, flower, or other"""
    try:
        image_bytes = await file.read()
        img = Image.open(io.BytesIO(image_bytes))
        
        # Check if it's a leaf
        is_leaf, leaf_msg = detect_if_leaf(img)
        
        # Check if it might be a flower (by shape/color)
        img_array = np.array(img)
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
        
        # Flower detection (basic - high saturation and variety of colors)
        saturation = np.mean(hsv[:, :, 1])
        has_flower_colors = saturation > 100
        
        if is_leaf:
            return {
                "type": "leaf",
                "message": "This appears to be a plant leaf. Use /predict for disease detection."
            }
        elif has_flower_colors:
            return {
                "type": "flower",
                "message": "This appears to be a flower. Use /predict_flower for flower classification."
            }
        else:
            return {
                "type": "other",
                "message": "This doesn't appear to be a plant leaf or flower. Please upload a clear photo of a plant leaf for disease detection."
            }
            
    except Exception as e:
        return {"error": str(e)}
@app.post("/recommend")
async def get_recommendation(data: dict):
    try:
        location = data.get('location', 'Rawalpindi')
        crop = data.get('crop', 'Tomato')
        growth_stage = data.get('growth_stage', 'Vegetative')
        season = data.get('season', 'Spring')
        language = data.get('language', 'en')

        # Detailed English Recommendation
        detailed_recommendation = f"""
🌾 **Detailed Recommendation for {crop}**

📍 **Location**: {location}  
📅 **Season**: {season}  
🌱 **Growth Stage**: {growth_stage}

### 1. Current Growth Stage Care
• Water deeply but avoid waterlogging
• Use appropriate fertilizer according to stage
• Ensure proper sunlight and air flow
• Regular monitoring for pests and diseases

### 2. Important Farming Tips
• Morning watering is best for plants
• Use well decomposed organic compost
• Maintain proper distance between plants
• Clean tools after every use to prevent disease spread

### 3. Seasonal Advice ({season})
• Adjust your practices according to weather conditions
• Protect plants from extreme heat or cold

### 4. Common Problems & Solutions
• Watch for yellow leaves, spots, or insects daily
• Use neem oil as natural pesticide
"""

        if language == 'ur':
            detailed_recommendation = f"""
🌾 **{crop} کے لیے تفصیلی ہدایات**

📍 **مقام**: {location}  
📅 **موسم**: {season}  
🌱 **نشوونما کا مرحلہ**: {growth_stage}

### 1. موجودہ مرحلہ کی دیکھ بھال
• جڑوں تک پانی دیں، زیادہ پانی نہ لگائیں
• مناسب کھاد استعمال کریں
• اچھی روشنی اور ہوا کی آمدورفت رکھیں
• روزانہ کیڑوں اور بیماریوں کی جانچ کریں

### 2. اہم فارمنگ ٹپس
• صبح سویرے پانی دیں
• سڑی ہوئی کھاد استعمال کریں
• پودوں کے درمیان مناسب فاصلہ رکھیں
• بیماری پھیلنے سے بچنے کے لیے آلات صاف رکھیں

### 3. موسمی مشورہ ({season})
• موسم کے مطابق دیکھ بھال کریں
• شدید گرمی یا سردی سے پودوں کی حفاظت کریں
"""

        # Symptom Images
        symptom_images = {
            "default": {
                "healthy": "https://picsum.photos/id/133/600/400",
                "powdery_mildew": "https://picsum.photos/id/1015/600/400",
                "leaf_rust": "https://picsum.photos/id/201/600/400"
            }
        }

        return {
            "crop": crop,
            "growth_stage": growth_stage,
            "location": location,
            "season": season,
            "language": language,
            "recommendation": detailed_recommendation.strip(),
            "symptom_images": symptom_images["default"]
        }

    except Exception as e:
        return {"error": str(e), "recommendation": "Something went wrong. Please try again."}


if __name__ == "__main__":
    import uvicorn
    print("🚀 Server starting at http://0.0.0.0:8000")
    print("📍 Endpoints:")
    print("   → POST /predict         → Plant Disease Detection")
    print("   → POST /predict_flower  → Flower Classification")
    print("   → POST /recommend       → Farming Recommendations")
    uvicorn.run(app, host="0.0.0.0", port=8000)