import tensorflow as tf
import os

MODEL_PATH = 'crop_model.h5'
if os.path.exists(MODEL_PATH):
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully.")
        model.summary()
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print("Model file not found.")
