import os
import zipfile
import subprocess
import shutil

def fetch_and_merge():
    # 1. Define datasets
    datasets = [
        {"slug": "emmarex/plantdisease", "zip_name": "plantdisease.zip", "folder_name": "plantvillage"},
        {"slug": "mahmoudshaheen1134/lemon-leaf-disease-dataset-lldd", "zip_name": "lemon-leaf-disease-dataset-lldd.zip", "folder_name": "lemon_dataset"},
        {"slug": "thegoanpanda/rice-crop-diseases", "zip_name": "rice-crop-diseases.zip", "folder_name": "rice_dataset"}
    ]
    
    # 2. Setup paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, 'data')
    merged_dir = os.path.join(data_dir, 'merged_dataset')
    kaggle_path = r"C:\Users\anuna\AppData\Roaming\Python\Python314\Scripts\kaggle.exe"
    
    os.makedirs(data_dir, exist_ok=True)
    os.makedirs(merged_dir, exist_ok=True)
    
    # Set environment variable for Kaggle API
    os.environ['KAGGLE_CONFIG_DIR'] = base_dir

    for ds in datasets:
        slug = ds["slug"]
        zip_path = os.path.join(data_dir, ds["zip_name"])
        extract_path = os.path.join(data_dir, ds["folder_name"])
        
        # Download if zip doesn't exist
        if not os.path.exists(zip_path):
            print(f"Downloading {slug}...")
            try:
                subprocess.run([kaggle_path, "datasets", "download", "-d", slug, "-p", data_dir], check=True)
            except Exception as e:
                print(f"Error downloading {slug}: {e}")
                continue
        
        # Extract
        if not os.path.exists(extract_path):
            print(f"Extracting {ds['zip_name']}...")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_path)
    
    # 3. Merge Logic
    print("Merging datasets into 'merged_dataset'...")
    
    # Source paths
    # PlantVillage: data/plantvillage/PlantVillage/PlantVillage/<classes>
    pv_source = os.path.join(data_dir, "plantvillage", "PlantVillage", "PlantVillage")
    # Lemon: data/lemon_dataset/Original Dataset/<classes>
    lemon_source = os.path.join(data_dir, "lemon_dataset", "Original Dataset")
    
    # Clean merged_dir if it has the wrong structure from previous run
    if os.path.exists(os.path.join(merged_dir, "Original Dataset")):
        shutil.rmtree(os.path.join(merged_dir, "Original Dataset"))

    # Process PlantVillage (no prefix needed as they are already descriptive)
    if os.path.exists(pv_source):
        for item in os.listdir(pv_source):
            item_path = os.path.join(pv_source, item)
            if os.path.isdir(item_path):
                target_path = os.path.join(merged_dir, item)
                if not os.path.exists(target_path):
                    print(f"Adding PlantVillage class: {item}")
                    shutil.copytree(item_path, target_path)

    # Process Lemon (add 'Lemon_' prefix)
    if os.path.exists(lemon_source):
        for item in os.listdir(lemon_source):
            item_path = os.path.join(lemon_source, item)
            if os.path.isdir(item_path):
                # Clean name: remove spaces
                clean_name = item.replace(" ", "_")
                target_path = os.path.join(merged_dir, f"Lemon_{clean_name}")
                if not os.path.exists(target_path):
                    print(f"Adding Lemon class: Lemon_{clean_name}")
                    shutil.copytree(item_path, target_path)

    # Process Rice (add 'Rice_' prefix)
    rice_source = os.path.join(data_dir, "rice_dataset", "Rice_Diseases")
    if not os.path.exists(rice_source):
        # Fallback to direct rice_dataset folder
        rice_source = os.path.join(data_dir, "rice_dataset")

    if os.path.exists(rice_source):
        for item in os.listdir(rice_source):
            item_path = os.path.join(rice_source, item)
            if os.path.isdir(item_path):
                # Clean name: remove spaces
                clean_name = item.replace(" ", "_")
                target_path = os.path.join(merged_dir, f"Rice_{clean_name}")
                if not os.path.exists(target_path):
                    print(f"Adding Rice class: Rice_{clean_name}")
                    shutil.copytree(item_path, target_path)

    print(f"Data merge complete! Merged dataset located at: {merged_dir}")

if __name__ == "__main__":
    fetch_and_merge()
