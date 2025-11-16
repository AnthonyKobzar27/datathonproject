import pandas as pd
import numpy as np
import os
import warnings
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.neighbors import KNeighborsClassifier

warnings.filterwarnings('ignore')

# Feature columns
numerical_cols = ['Respiratory_Rate', 'Oxygen_Saturation', 'O2_Scale', 'Systolic_BP', 
                  'Heart_Rate', 'Temperature', 'On_Oxygen']
categorical_cols = ['Consciousness']

def train_model(csv_path=None):
    """Train KNN model and return model, scaler, and encoders"""
    if csv_path is None:
        csv_path = os.path.join(os.path.dirname(__file__), 'Health_Risk_Dataset.csv')
    data = pd.read_csv(csv_path)
    
    X = data[numerical_cols + categorical_cols].copy()
    y = data['Risk_Level'].copy()
    
    le_consciousness = LabelEncoder()
    X['Consciousness_encoded'] = le_consciousness.fit_transform(X['Consciousness'])
    X = X.drop('Consciousness', axis=1)
    
    le_target = LabelEncoder()
    y_encoded = le_target.fit_transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    kfold = KFold(n_splits=5, shuffle=True, random_state=42)
    k_values = range(1, 31)
    cv_scores = []
    
    for k in k_values:
        knn = KNeighborsClassifier(n_neighbors=k)
        scores = cross_val_score(knn, X_train_scaled, y_train, cv=kfold, scoring='accuracy')
        cv_scores.append(scores.mean())
    
    optimal_k = k_values[np.argmax(cv_scores)]
    knn_model = KNeighborsClassifier(n_neighbors=optimal_k)
    knn_model.fit(X_train_scaled, y_train)
    
    return knn_model, scaler, le_consciousness, le_target

def predict_risk_level(model, scaler, le_consciousness, le_target,
                       respiratory_rate, oxygen_saturation, o2_scale, systolic_bp, 
                       heart_rate, temperature, consciousness, on_oxygen):
    """Predict risk level for a new patient"""
    features = np.array([[respiratory_rate, oxygen_saturation, o2_scale, systolic_bp, 
                          heart_rate, temperature, on_oxygen]])
    
    consciousness_encoded = le_consciousness.transform([consciousness])[0]
    features = np.append(features[0], consciousness_encoded).reshape(1, -1)
    
    features_scaled = scaler.transform(features)
    
    prediction_encoded = model.predict(features_scaled)[0]
    prediction = le_target.inverse_transform([prediction_encoded])[0]
    
    probabilities = model.predict_proba(features_scaled)[0]
    prob_dict = {le_target.classes_[i]: float(prob) for i, prob in enumerate(probabilities)}
    
    return prediction, prob_dict
