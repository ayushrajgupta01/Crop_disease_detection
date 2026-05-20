import os
import sys
import subprocess

def setup_and_train():
    print(">>> Initializing Data Pipeline...")
    
    # 1. Fetch and Merge all datasets (PlantVillage, Lemon, and Rice)
    try:
        from fetch_data import fetch_and_merge
        fetch_and_merge()
    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    # 2. Start Training using the merged dataset
    print("\n>>> Launching Training Engine...")
    try:
        from train import train_model
        # Use absolute or relative path consistently
        base_dir = os.path.dirname(os.path.abspath(__file__))
        merged_dir = os.path.join(base_dir, 'data', 'merged_dataset')
        
        if os.path.exists(merged_dir):
            train_model(merged_dir)
        else:
            print(f"Error: Merged dataset not found at {merged_dir}")
    except Exception as e:
        print(f"Error during training: {e}")

if __name__ == "__main__":
    setup_and_train()
