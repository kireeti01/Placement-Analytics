import os
import joblib
import pandas as pd

class PlacementModel:
    def __init__(self, model_path=None):
        if model_path is None:
            # Default model file path relative to this file
            model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'placement_model.joblib')
        self.model_path = model_path
        self.pipeline = None
        self.load()

    def load(self):
        try:
            if os.path.exists(self.model_path):
                self.pipeline = joblib.load(self.model_path)
                print(f"PlacementModel: [OK] Loaded trained model pipeline from {self.model_path}")
            else:
                print(f"PlacementModel: [WARN] Model file not found at {self.model_path}")
        except Exception as e:
            print(f"PlacementModel: [ERROR] Error loading model from {self.model_path}: {e}")

    def predict_probability(self, profile):
        if self.pipeline is None:
            raise ValueError("Model is not loaded.")
        
        # Map profile keys to standard feature names
        data = {
            'cgpa': [float(profile.get('cgpa', 0) or 0)],
            'coding_score': [int(profile.get('coding', 0) or 0)],
            'internships_count': [int(profile.get('internships', 0) or 0)],
            'attendance_percentage': [int(profile.get('attendance', 0) or 0)],
            'projects_count': [int(profile.get('projects', 0) or 0)],
            'communication_score': [int(profile.get('communication', 0) or 0)],
            'branch': [(profile.get('branch') or 'cse').lower()],
            'selected_skills_count': [len(profile.get('selectedSkills', []) or [])]
        }
        df = pd.DataFrame(data)
        
        # Predict class probabilities: [prob_unplaced, prob_placed]
        probabilities = self.pipeline.predict_proba(df)
        prob_placed = probabilities[0][1]
        
        # Convert to percentage and clamp to [0, 98] to match UI bounds
        probability_percentage = int(round(prob_placed * 100))
        return min(max(probability_percentage, 0), 98)
