import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
import os

# 1. Approach: Transfer Learning with MobileNetV2 + Fine-tuning
# Why MobileNetV2? 
# - It is highly efficient for mobile and edge devices.
# - It provides high accuracy with much fewer parameters.

def train_model(dataset_path, save_path='crop_model.h5'):
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32

    # 2. Data Augmentation using MobileNetV2 preprocessing
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=25,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2
    )

    train_generator = train_datagen.flow_from_directory(
        dataset_path,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    validation_generator = train_datagen.flow_from_directory(
        dataset_path,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )

    # 3. Model Architecture
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False # Phase 1: Freeze base model

    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(train_generator.num_classes, activation='softmax')
    ])

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    # 4. Save Class Names
    with open('classes.txt', 'w') as f:
        for class_name in train_generator.class_indices.keys():
            f.write(f"{class_name}\n")
    print("Class indices saved to classes.txt")

    # 5. Training Phase 1: Train the Head
    print("\n>>> Phase 1: Training the Head (Frozen Base)...")
    model.fit(
        train_generator,
        epochs=10,
        validation_data=validation_generator
    )

    # 6. Phase 2: Fine-tuning
    print("\n>>> Phase 2: Fine-tuning (Unfreezing Top Layers)...")
    base_model.trainable = True
    
    # We unfreeze everything from layer 100 onwards
    # MobileNetV2 has 154 layers
    for layer in base_model.layers[:100]:
        layer.trainable = False

    # Use a much lower learning rate for fine-tuning
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-5), 
        loss='categorical_crossentropy', 
        metrics=['accuracy']
    )

    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        save_path, 
        monitor='val_accuracy', 
        save_best_only=True, 
        mode='max',
        verbose=1
    )

    model.fit(
        train_generator,
        epochs=10,
        validation_data=validation_generator,
        callbacks=[checkpoint]
    )

    print(f"\nFinal model saved to {save_path}")

if __name__ == "__main__":
    DATASET_DIR = './data/merged_dataset' 
    if os.path.exists(DATASET_DIR):
        train_model(DATASET_DIR)
    else:
        print(f"Error: Dataset not found at {DATASET_DIR}")

