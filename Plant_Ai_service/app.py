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
        location = data.get('location', 'Pakistan')
        crop = data.get('crop', 'Tomato')
        growth_stage = data.get('growth_stage', 'Vegetative')
        season = data.get('season', 'Spring')
        
        # Expanded recommendation database
        recommendations = {
            "Tomato": {
                "Seedling": {
                    "water": "Keep soil consistently moist but not waterlogged",
                    "fertilizer": "Low nitrogen, high phosphorus for root development",
                    "sunlight": "14-16 hours of light if indoors",
                    "pests": "Watch for cutworms and aphids"
                },
                "Vegetative": {
                    "water": "Water deeply 2-3 times per week",
                    "fertilizer": "Apply nitrogen-rich fertilizer (10-5-5)",
                    "sunlight": "6-8 hours of direct sunlight",
                    "pests": "Monitor for hornworms and whiteflies"
                },
                "Flowering": {
                    "water": "Consistent watering to prevent blossom end rot",
                    "fertilizer": "Switch to phosphorus-rich fertilizer (5-10-5)",
                    "sunlight": "8-10 hours for optimal flowering",
                    "pests": "Check for aphids on new growth"
                },
                "Fruiting": {
                    "water": "Deep watering 2-3x weekly, avoid leaf wetting",
                    "fertilizer": "Reduce nitrogen, increase potassium for fruit quality",
                    "sunlight": "Full sun (6-8 hours minimum)",
                    "pests": "Watch for tomato hornworms, fruit borers"
                }
            },
            "Potato": {
                "Vegetative": {
                    "water": "Keep soil evenly moist, 1-2 inches per week",
                    "fertilizer": "Balanced NPK (10-10-10) at planting",
                    "sunlight": "Full sun - 6+ hours daily",
                    "pests": "Watch for Colorado potato beetles"
                },
                "Flowering": {
                    "water": "Increase watering, especially during tuber formation",
                    "fertilizer": "Apply phosphorus-rich fertilizer",
                    "sunlight": "Full sun essential",
                    "pests": "Monitor for leafhoppers and blight"
                },
                "Harvest": {
                    "water": "Stop watering 2 weeks before harvest",
                    "fertilizer": "No fertilizer after flowers appear",
                    "sunlight": "Let vines die back naturally",
                    "pests": "Check for wireworms at harvest"
                }
            },
            "Pepper": {
                "Seedling": {
                    "water": "Keep warm, moist soil (75-85°F)",
                    "fertilizer": "Start with half-strength balanced fertilizer",
                    "sunlight": "16 hours light indoors",
                    "pests": "Watch for damping off fungus"
                },
                "Vegetative": {
                    "water": "Regular watering, don't let soil dry completely",
                    "fertilizer": "Nitrogen-rich fertilizer for leaf growth",
                    "sunlight": "6-8 hours direct sun",
                    "pests": "Monitor for aphids and spider mites"
                },
                "Flowering": {
                    "water": "Consistent moisture, avoid drought stress",
                    "fertilizer": "Switch to bloom booster (high phosphorus)",
                    "sunlight": "8-10 hours for best flowering",
                    "pests": "Watch for thrips and blossom drop"
                },
                "Fruiting": {
                    "water": "Deep watering 2x weekly",
                    "fertilizer": "Reduce nitrogen, increase potassium",
                    "sunlight": "Full sun for ripening",
                    "pests": "Monitor for pepper weevils"
                }
            },
            "Corn": {
                "Vegetative": {
                    "water": "1-1.5 inches water per week",
                    "fertilizer": "Side-dress with nitrogen at knee-high stage",
                    "sunlight": "Full sun mandatory",
                    "pests": "Watch for cutworms, armyworms"
                },
                "Flowering": {
                    "water": "Critical period - keep soil moist",
                    "fertilizer": "No additional nitrogen after tasseling",
                    "sunlight": "Full sun for pollen development",
                    "pests": "Monitor for corn earworms"
                },
                "Harvest": {
                    "water": "Reduce water as silks brown",
                    "fertilizer": "None needed",
                    "sunlight": "Continue full sun",
                    "pests": "Check for birds, harvest promptly"
                }
            },
            "Wheat": {
                "Vegetative": {
                    "water": "Moderate watering, avoid waterlogging",
                    "fertilizer": "Apply nitrogen early for tillering",
                    "sunlight": "Full sun essential",
                    "pests": "Watch for aphids and rust"
                },
                "Flowering": {
                    "water": "Maintain soil moisture, critical period",
                    "fertilizer": "No nitrogen after heading",
                    "sunlight": "Full sun needed",
                    "pests": "Monitor for fusarium head blight"
                },
                "Harvest": {
                    "water": "Stop watering 2 weeks before harvest",
                    "fertilizer": "None needed",
                    "sunlight": "Allow to dry naturally",
                    "pests": "Check for grain weevils"
                }
            },
            "Cotton": {
                "Vegetative": {
                    "water": "Deep watering weekly",
                    "fertilizer": "Balanced NPK at planting",
                    "sunlight": "Full sun required",
                    "pests": "Watch for boll weevils, aphids"
                },
                "Flowering": {
                    "water": "Critical - don't let soil dry",
                    "fertilizer": "Side-dress with nitrogen",
                    "sunlight": "Continue full sun",
                    "pests": "Monitor for pink bollworm"
                },
                "Harvest": {
                    "water": "Stop watering when bolls open",
                    "fertilizer": "None needed after flowering",
                    "sunlight": "Allow bolls to dry",
                    "pests": "Check for stainers"
                }
            }
        }
        
        # Season-specific advice
        season_advice = {
            "Spring": "Start seeds indoors 6-8 weeks before last frost. Prepare soil with compost.",
            "Summer": "Mulch to retain moisture. Water early morning or evening. Provide shade if extremely hot.",
            "Autumn": "Harvest remaining crops. Plant cover crops. Clean up plant debris.",
            "Winter": "Plan next season. Order seeds. Maintain tools. Protect perennials."
        }
        
        # Location-specific tips (Pakistan regions)
        location_tips = {
            "Faisalabad": "Hot semi-arid climate. Focus on heat-tolerant varieties.",
            "Lahore": "Subtropical climate with monsoon rains. Ensure good drainage.",
            "Karachi": "Humid coastal climate. Watch for fungal diseases.",
            "Islamabad": "Pleasant climate. Extended growing season possible.",
            "default": "Adjust planting times based on local frost dates."
        }
        
        # Get crop recommendations
        crop_data = recommendations.get(crop, {}).get(growth_stage, {})
        
        if crop_data:
            recommendation = f"""
🌱 {crop} - {growth_stage} Stage Summary:

💧 Watering: {crop_data.get('water', 'Water regularly as needed')}

🌿 Fertilizer: {crop_data.get('fertilizer', 'Use balanced fertilizer monthly')}

☀️ Sunlight: {crop_data.get('sunlight', 'Full sun recommended')}

🐛 Pest Watch: {crop_data.get('pests', 'Regular monitoring recommended')}

📅 Season Tip: {season_advice.get(season, 'Adjust care based on weather')}

📍 Location Tip: {location_tips.get(location, location_tips['default'])}
            """
        else:
            recommendation = f"""
📋 General {growth_stage} Stage Care for {crop}:

• Water: Maintain consistent soil moisture during {growth_stage} stage
• Fertilizer: Use balanced fertilizer based on growth needs
• Sunlight: Ensure adequate sunlight for healthy development
• Monitoring: Check regularly for pests and diseases

🌦️ Season ({season}): {season_advice.get(season, 'Follow seasonal best practices')}

📍 Location ({location}): {location_tips.get(location, 'Adapt to local climate conditions')}

For specific {crop} varieties, consult local agricultural extension services.
            """
        
        return {
            "recommendation": recommendation.strip(),
            "short_recommendation": f"For {crop} in {growth_stage} stage: {crop_data.get('water', 'Water regularly')}",
            "location": location,
            "crop": crop,
            "growth_stage": growth_stage,
            "season": season,
            "details": crop_data if crop_data else None
        }
        
    except Exception as e:
        print(f"Recommendation error: {str(e)}")
        return {
            "recommendation": "Regular monitoring recommended. Ensure proper watering (2-3 times/week), adequate sunlight (6-8 hours), and balanced fertilizer. Consult local agricultural expert for specific crop advice.",
            "short_recommendation": "Maintain regular care and monitor for pests",
            "error": str(e)
        }
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