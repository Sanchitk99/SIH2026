from inference_sdk import InferenceHTTPClient, InferenceConfiguration
import io
from core.config import settings

class AIService:
    def __init__(self):
        # Initialize the Roboflow client
        self.client = InferenceHTTPClient(
            api_url="https://serverless.roboflow.com",
            api_key=settings.ROBOFLOW_API_KEY
        ).configure(InferenceConfiguration(api_key_transport="header"))
        
        # We are using the high-accuracy TRCProject model
        self.model_id = "e-waste-detection-model/1" 

    def predict_ewaste_category(self, image_bytes: bytes) -> dict:
        try:
            # Roboflow expects a file-like object or a path, we wrap bytes in BytesIO
            # Or you can pass the image directly as a base64 string or numpy array
            from PIL import Image
            import numpy as np
            
            image = Image.open(io.BytesIO(image_bytes))
            image_array = np.array(image)

            # Send to Roboflow
            result = self.client.infer(image_array, model_id=self.model_id)
            
            predictions = result.get("predictions", [])
            if not predictions:
                return {
                    "predicted_category": "Unknown",
                    "confidence_score": 0.0,
                    "requires_manual_review": True
                }

            # Get the highest confidence prediction
            top_prediction = max(predictions, key=lambda x: x['confidence'])
            confidence = round(top_prediction['confidence'], 2)
            
            return {
                "predicted_category": top_prediction['class'],
                "confidence_score": confidence,
                "requires_manual_review": confidence < 0.85,
                "raw_data": result # Contains bounding box info if you want to draw it on frontend
            }
            
        except Exception as e:
            return {
                "predicted_category": "Error",
                "confidence_score": 0.0,
                "requires_manual_review": True,
                "error": str(e)
            }