import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
import os

# 1. Approach: Transfer Learning with MobileNetV2
# Why MobileNetV2? 
# - It is highly efficient for mobile and edge devices (matching the "mobile-based" requirement).
# - It provides high accuracy with much fewer parameters than ResNet or VGG.

def train_model(dataset_path, save_path='crop_model.h5'):
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32

    # 2. Data Augmentation (Crucial for robust disease detection)
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
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
    base_model.trainable = False # Freeze the base layers

    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(train_generator.num_classes, activation='softmax')
    ])

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    # 4. Save Class Names BEFORE training (allows API to link early)
    with open('classes.txt', 'w') as f:
        for class_name in train_generator.class_indices.keys():
            f.write(f"{class_name}\n")
    print("Class indices saved to classes.txt")

    # 5. Callbacks for saving and stopping
    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        save_path, 
        monitor='val_accuracy', 
        save_best_only=True, 
        mode='max',
        verbose=1
    )

    # 6. Training
    print("Starting Training...")
    model.fit(
        train_generator,
        epochs=10,
        validation_data=validation_generator,
        callbacks=[checkpoint]
    )

    print(f"Final model saved to {save_path}")

if __name__ == "__main__":
    # The user should provide the path to the downloaded Kaggle dataset
    DATASET_DIR = './data/plantvillage/PlantVillage/PlantVillage' 
    if os.path.exists(DATASET_DIR):
        train_model(DATASET_DIR)
    else:
        print(f"Error: Dataset not found at {DATASET_DIR}")
        print("Please download the Kaggle dataset and extract it to the data folder.")
