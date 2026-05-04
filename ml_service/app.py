from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
from PIL import Image
import tensorflow as tf

app = Flask(__name__)
CORS(app)

# Load Model if it exists
MODEL_PATH = 'crop_model.h5'
CLASS_PATH = 'classes.txt'
model = None
class_names = []

print(f"Checking for model files: {MODEL_PATH}, {CLASS_PATH}")
if os.path.exists(MODEL_PATH) and os.path.exists(CLASS_PATH):
    print("Files found, attempting to load...")
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        with open(CLASS_PATH, 'r') as f:
            class_names = [line.strip() for line in f.readlines()]
        print(f"Model loaded: {len(class_names)} classes detected.")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"Model files not found! MODEL_PATH: {os.path.exists(MODEL_PATH)}, CLASS_PATH: {os.path.exists(CLASS_PATH)}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image uploaded"}), 400
        
        image_file = request.files['image']
        
        # Real Inference
        if model:
            img = Image.open(image_file).convert('RGB').resize((224, 224))
            img_array = np.array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            
            predictions = model.predict(img_array)
            class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][class_idx])
            disease_name = class_names[class_idx]
            
            # Simple metadata mapping based on common diseases in PlantVillage
            info_map = {
                "Tomato_Late_blight": {
                    "treatment": "Apply fungicides like Chlorothalonil. Remove infected debris.",
                    "fertilizer": "Avoid high nitrogen fertilizers."
                },
                "Potato_Early_blight": {
                    "treatment": "Use Mancozeb or Chlorothalonil. Rotate crops.",
                    "fertilizer": "Maintain high Potassium levels."
                },
                "Healthy": {
                    "treatment": "No disease detected. Keep monitoring.",
                    "fertilizer": "Standard N-P-K balance (10-10-10)."
                }
            }
            
            info = info_map.get(disease_name, {
                "treatment": "Consult an agricultural expert. Isolate infected plants.",
                "fertilizer": "Use balanced organic compost."
            })

            return jsonify({
                "name": disease_name.replace("_", " "),
                "confidence": confidence,
                "treatment": info["treatment"],
                "fertilizer": info["fertilizer"]
            })

        # Fallback while training
        else:
            return jsonify({
                "name": "Neural Link Initializing...",
                "confidence": 0.0,
                "treatment": "The AI model is currently being trained in the background. Real predictions will be available once the first epoch completes (~15 mins).",
                "fertilizer": "Please wait for the system to synchronize with the new dataset.",
                "warning": "Training in progress. Running in TEMPORARY mode."
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
