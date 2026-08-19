import os
import random
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Set random seeds for reproducibility
random.seed(42)
np.random.seed(42)

# Directory configurations
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATA_DIR, 'sample_data.csv')
MODEL_PATH = os.path.join(MODELS_DIR, 'placement_model.joblib')

def generate_synthetic_data(num_samples=2500):
    print(f"Generating {num_samples} synthetic student profiles...")
    
    branches = ['cse', 'ece', 'eee', 'mech', 'civil']
    branch_weights = {
        'cse': 0.08,
        'ece': 0.06,
        'eee': 0.04,
        'mech': 0.02,
        'civil': 0.00
    }
    
    records = []
    for i in range(num_samples):
        cgpa = round(random.uniform(5.5, 10.0), 2)
        coding_score = random.randint(150, 950)
        internships_count = random.randint(0, 3)
        attendance_percentage = random.randint(55, 100)
        projects_count = random.randint(0, 5)
        communication_score = random.randint(40, 100)
        branch = random.choice(branches)
        selected_skills_count = random.randint(0, 8)
        
        # Calculate underlying placement probability
        # Features are normalized to [0, 1] relative weights
        cgpa_score = ((cgpa - 5.5) / 4.5) * 0.30
        coding_factor = ((coding_score - 150) / 800) * 0.25
        internship_factor = (internships_count / 3) * 0.18
        attendance_factor = ((attendance_percentage - 55) / 45) * 0.12
        projects_factor = (projects_count / 5) * 0.08
        comm_factor = ((communication_score - 40) / 60) * 0.03
        branch_factor = branch_weights[branch]
        skills_factor = (selected_skills_count / 8) * 0.04
        
        prob_raw = (cgpa_score + coding_factor + internship_factor + 
                    attendance_factor + projects_factor + comm_factor + 
                    branch_factor + skills_factor)
        
        # Add slight non-linear thresholding and noise to make the ML problem realistic
        p = prob_raw
        if cgpa >= 8.5 and coding_score >= 700:
            p += 0.05 # Dream profile boost
        elif cgpa < 6.5 or attendance_percentage < 70:
            p -= 0.10 # Academic risk penalty
            
        p = max(0.05, min(0.95, p)) # Clamp prob
        
        # Draw binary classification label: placed (1) or unplaced (0)
        placed = 1 if random.random() < p else 0
        
        records.append({
            'cgpa': cgpa,
            'coding_score': coding_score,
            'internships_count': internships_count,
            'attendance_percentage': attendance_percentage,
            'projects_count': projects_count,
            'communication_score': communication_score,
            'branch': branch,
            'selected_skills_count': selected_skills_count,
            'placed': placed
        })
        
    df = pd.DataFrame(records)
    df.to_csv(CSV_PATH, index=False)
    print(f"Dataset successfully saved to {CSV_PATH}")
    return df

def train_model():
    # 1. Generate or load dataset
    if not os.path.exists(CSV_PATH) or os.path.getsize(CSV_PATH) == 0:
        df = generate_synthetic_data()
    else:
        df = pd.read_csv(CSV_PATH)
        print(f"Loaded existing dataset from {CSV_PATH} (shape: {df.shape})")
        
    # 2. Split features and target
    X = df.drop(columns=['placed'])
    y = df['placed']
    
    # 3. Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 4. Define Column Transformers
    numeric_features = [
        'cgpa', 'coding_score', 'internships_count', 
        'attendance_percentage', 'projects_count', 
        'communication_score', 'selected_skills_count'
    ]
    categorical_features = ['branch']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ]
    )
    
    # 5. Define ML Pipeline
    # Random Forest is highly suitable for multi-modal numerical/categorical tabular features
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42))
    ])
    
    # 6. Fit the model pipeline
    print("Training model pipeline...")
    pipeline.fit(X_train, y_train)
    
    # 7. Evaluate
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print("\n=== Model Performance ===")
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # 8. Feature Importances
    classifier = pipeline.named_steps['classifier']
    cat_encoder = pipeline.named_steps['preprocessor'].named_transformers_['cat']
    one_hot_cols = list(cat_encoder.get_feature_names_out(categorical_features))
    feature_names = numeric_features + one_hot_cols
    
    importances = classifier.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    print("\n=== Feature Importances ===")
    for f in range(len(feature_names)):
        print(f"{f + 1}. {feature_names[indices[f]]:<25}: {importances[indices[f]]:.4f}")
        
    # 9. Save model pipeline
    joblib.dump(pipeline, MODEL_PATH)
    print(f"\nModel pipeline successfully saved to {MODEL_PATH}")

if __name__ == '__main__':
    train_model()
