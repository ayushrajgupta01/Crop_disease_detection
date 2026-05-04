import os
import zipfile
import subprocess
import sys

def setup_and_train():
    dataset = "emmarex/plantdisease"
    print(f"Starting automation for: {dataset}")
    
    # Set environment variable for Kaggle API to look in current directory
    os.environ['KAGGLE_CONFIG_DIR'] = os.getcwd()
    
    # 1. Create data directory
    if not os.path.exists('data'):
        os.makedirs('data')

    try:
        # 2. Download from Kaggle
        print("Downloading dataset (this may take a few minutes)...")
        kaggle_path = r"C:\Users\anuna\AppData\Roaming\Python\Python314\Scripts\kaggle.exe"
        subprocess.run([kaggle_path, "datasets", "download", "-d", dataset, "-p", "data"], check=True)
        
        # 3. Unzip
        print("Extracting files...")
        zip_path = os.path.join("data", "plantdisease.zip")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall("data/plantvillage")
        
        print("Data ready!")

        # 4. Start Training
        print("Launching Training Engine...")
        # Import the train_model function from our existing train.py
        from train import train_model
        train_model("data/plantvillage/PlantVillage/PlantVillage")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    setup_and_train()
