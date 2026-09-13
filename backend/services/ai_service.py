from __future__ import annotations

import io
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from typing import Any

from inference_sdk import InferenceConfiguration, InferenceHTTPClient
from PIL import Image

from core.config import settings
from services.workflow_parser import extract_workflow_prediction


WORKSPACE_NAME = "siddharth-singh-np6gv"
WORKFLOW_ID = "e-waste-ve-waste-oeexv-iyzv5-1-rfdetr-small-t1-logic"


class RoboflowWorkflowError(RuntimeError):
    """Raised when the configured Roboflow workflow cannot be executed."""


class AIService:
    def __init__(self) -> None:
        self.client: InferenceHTTPClient | None = None
        if settings.ROBOFLOW_API_KEY:
            self.client = InferenceHTTPClient(
                api_url="https://serverless.roboflow.com",
                api_key=settings.ROBOFLOW_API_KEY,
            )
            self.client.configure(InferenceConfiguration(api_key_transport="header"))

    def _run_workflow_once(self, image: Image.Image) -> list[dict[str, Any]]:
        if self.client is None:
            raise RoboflowWorkflowError("AI classification is not configured")

        executor = ThreadPoolExecutor(max_workers=1)
        future = executor.submit(
            self.client.run_workflow,
            workspace_name=WORKSPACE_NAME,
            workflow_id=WORKFLOW_ID,
            images={"image": image},
            parameters={},
        )
        try:
            result = future.result(timeout=settings.ROBOFLOW_TIMEOUT_SECONDS)
        except FutureTimeoutError as error:
            future.cancel()
            raise RoboflowWorkflowError(
                f"Roboflow workflow timed out after {settings.ROBOFLOW_TIMEOUT_SECONDS} seconds"
            ) from error
        except Exception as error:
            raise RoboflowWorkflowError("Roboflow workflow request failed") from error
        finally:
            executor.shutdown(wait=False, cancel_futures=True)

        if not isinstance(result, list) or not result or not isinstance(result[0], dict):
            raise RoboflowWorkflowError("Roboflow returned an unexpected workflow response")
        return result

    def predict_ewaste_category(self, image_bytes: bytes) -> dict[str, Any]:
        if not image_bytes:
            raise RoboflowWorkflowError("The uploaded image is empty")

        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as error:
            raise RoboflowWorkflowError("The uploaded file is not a readable image") from error

        last_error: RoboflowWorkflowError | None = None
        for attempt in range(settings.ROBOFLOW_RETRIES + 1):
            try:
                workflow_result = self._run_workflow_once(image)
                predicted_category, confidence = extract_workflow_prediction(workflow_result[0])
                return {
                    "predicted_category": predicted_category,
                    "confidence_score": round(confidence, 3),
                    "requires_manual_review": predicted_category == "Unknown" or confidence < 0.85,
                }
            except RoboflowWorkflowError as error:
                last_error = error
                if attempt == settings.ROBOFLOW_RETRIES:
                    break
                time.sleep(0.5 * (2**attempt))

        raise RoboflowWorkflowError(str(last_error or "Roboflow workflow request failed")) from last_error
