from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import os
import numpy as np
from PIL import Image

app = Flask(__name__)
CORS(app)

# Load Model
MODEL_PATH = 'crop_model.h5'
CLASS_PATH = 'classes.txt'
model = None
class_names = []

if os.path.exists(MODEL_PATH) and os.path.exists(CLASS_PATH):
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        with open(CLASS_PATH, 'r') as f:
            class_names = [line.strip() for line in f.readlines()]
        print(f"Model loaded: {len(class_names)} classes.")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image uploaded"}), 400
        
        image_file = request.files['image']
        
        if model:
            img = Image.open(image_file).convert('RGB').resize((224, 224))
            img_array = np.array(img).astype(np.float32)
            # Use MobileNetV2 preprocessing (scales to [-1, 1])
            img_array = preprocess_input(img_array)
            img_array = np.expand_dims(img_array, axis=0)
            
            predictions = model.predict(img_array)
            class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][class_idx])
            disease_name = class_names[class_idx]
            
            # Comprehensive info map for all 15 classes
            info_map = {
                "Pepper__bell___Bacterial_spot": {
                    "treatment": "Use copper-based fungicides. Remove infected plants immediately.",
                    "fertilizer": "Maintain balanced Nitrogen. Avoid overhead watering."
                },
                "Pepper__bell___healthy": {
                    "treatment": "Plant is healthy. Continue routine care.",
                    "fertilizer": "Standard balanced N-P-K (5-10-10) during fruiting."
                },
                "Potato___Early_blight": {
                    "treatment": "Apply Mancozeb or Chlorothalonil. Improve air circulation.",
                    "fertilizer": "Ensure adequate Potassium to strengthen cell walls."
                },
                "Potato___Late_blight": {
                    "treatment": "Critical: Use fungicides like Ridomil. Burn infected debris.",
                    "fertilizer": "Avoid high Nitrogen, which encourages soft foliage."
                },
                "Potato___healthy": {
                    "treatment": "Healthy crop. Monitor for pests regularly.",
                    "fertilizer": "Apply compost tea or balanced organic fertilizer."
                },
                "Tomato_Bacterial_spot": {
                    "treatment": "Spray with streptomycin or copper-maneb. Rotate crops yearly.",
                    "fertilizer": "Use Calcium-rich fertilizer to prevent secondary issues."
                },
                "Tomato_Early_blight": {
                    "treatment": "Prune lower leaves. Apply copper spray or Bio-fungicides.",
                    "fertilizer": "Use organic mulch to prevent soil splashing."
                },
                "Tomato_Late_blight": {
                    "treatment": "Highly contagious! Use Chlorothalonil. Remove entire plant if severe.",
                    "fertilizer": "Stop Nitrogen application until disease is managed."
                },
                "Tomato_Leaf_Mold": {
                    "treatment": "Increase ventilation. Use fungicides like Dithane M-45.",
                    "fertilizer": "Avoid foliar feeding; stick to soil-level nutrients."
                },
                "Tomato_Septoria_leaf_spot": {
                    "treatment": "Avoid overhead irrigation. Apply fungicides early.",
                    "fertilizer": "Boost soil health with Phosphorus-rich compost."
                },
                "Tomato_Spider_mites_Two_spotted_spider_mite": {
                    "treatment": "Use Neem oil or insecticidal soap. Increase humidity.",
                    "fertilizer": "Avoid excessive Nitrogen, which attracts mites."
                },
                "Tomato__Target_Spot": {
                    "treatment": "Apply azoxystrobin or chlorothalonil. Remove old plant debris.",
                    "fertilizer": "Ensure consistent moisture to reduce plant stress."
                },
                "Tomato__Tomato_YellowLeaf__Curl_Virus": {
                    "treatment": "Transmitted by whiteflies. Use silver-colored reflective mulches.",
                    "fertilizer": "Support immunity with micronutrients (Zinc, Boron)."
                },
                "Tomato__Tomato_mosaic_virus": {
                    "treatment": "No cure. Remove and burn plants. Disinfect tools.",
                    "fertilizer": "Focus on preventative soil health for next season."
                },
                "Tomato_healthy": {
                    "treatment": "Optimal health. Maintain current growth conditions.",
                    "fertilizer": "Use Tomato-specific slow-release fertilizer."
                },
                "Lemon_Anthracnose": {
                    "treatment": "Prune dead twigs. Apply copper-based fungicides before rainy seasons.",
                    "fertilizer": "Maintain balanced nutrition to reduce tree stress."
                },
                "Lemon_Bacterial_Blight": {
                    "treatment": "Prune out infected twigs after rainy season. Use copper sprays.",
                    "fertilizer": "Avoid excessive late-season Nitrogen which encourages soft growth."
                },
                "Lemon_Citrus_Canker": {
                    "treatment": "Highly contagious. No cure; focus on prevention with copper bactericides.",
                    "fertilizer": "Use balanced N-P-K and ensure tools are sanitized."
                },
                "Lemon_Curl_Virus": {
                    "treatment": "Control whiteflies and leafminers with Neem oil or insecticidal soap.",
                    "fertilizer": "Support immunity with Zinc and Boron micronutrients."
                },
                "Lemon_Deficiency_Leaf": {
                    "treatment": "Likely Iron or Zinc deficiency. Check soil pH.",
                    "fertilizer": "Apply chelated iron or a complete citrus micronutrient spray."
                },
                "Lemon_Dry_Leaf": {
                    "treatment": "Check for underwatering or salt buildup in soil. Increase mulch.",
                    "fertilizer": "Flush soil with plain water, then apply liquid seaweed extract."
                },
                "Lemon_Healthy_Leaf": {
                    "treatment": "Tree is thriving. Monitor for seasonal pests.",
                    "fertilizer": "Apply balanced citrus fertilizer (e.g., 6-3-3) three times a year."
                },
                "Lemon_Sooty_Mould": {
                    "treatment": "Control aphids and scale insects using horticultural oil. Wash leaves.",
                    "fertilizer": "General purpose citrus fertilizer to maintain vigor."
                },
                "Lemon_Spider_Mites": {
                    "treatment": "Increase humidity. Use Neem oil or a strong water stream to dislodge mites.",
                    "fertilizer": "Avoid high Nitrogen, which can attract more mites."
                }
            }
            
            info = info_map.get(disease_name, {
                "treatment": "Consult an agricultural expert for this specific variant.",
                "fertilizer": "Use balanced organic compost."
            })

            return jsonify({
                "name": disease_name.replace("_", " ").replace("  ", " "),
                "confidence": confidence,
                "treatment": info["treatment"],
                "fertilizer": info["fertilizer"]
            })

        else:
            return jsonify({
                "name": "Model Loading...",
                "confidence": 0.0,
                "treatment": "The AI is synchronizing. Please wait for the training epoch to finish.",
                "fertilizer": "Standardizing Nutrient Protocols..."
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
