from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from brochacho import train_model, predict_risk_level
import uvicorn

# Global model components
model = None
scaler = None
le_consciousness = None
le_target = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup"""
    global model, scaler, le_consciousness, le_target
    model, scaler, le_consciousness, le_target = train_model()
    yield
    # Cleanup if needed

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PatientData(BaseModel):
    respiratory_rate: float
    oxygen_saturation: float
    o2_scale: int
    systolic_bp: float
    heart_rate: float
    temperature: float
    consciousness: str
    on_oxygen: int

class PredictionResponse(BaseModel):
    risk_level: str
    probabilities: dict

@app.get("/")
async def root():
    return {"message": "Health Risk Prediction API"}

@app.post("/predict", response_model=PredictionResponse)
async def predict(patient: PatientData):
    """Predict risk level for a patient"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
    try:
        risk_level, probabilities = predict_risk_level(
            model, scaler, le_consciousness, le_target,
            patient.respiratory_rate,
            patient.oxygen_saturation,
            patient.o2_scale,
            patient.systolic_bp,
            patient.heart_rate,
            patient.temperature,
            patient.consciousness,
            patient.on_oxygen
        )
        return PredictionResponse(risk_level=risk_level, probabilities=probabilities)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

