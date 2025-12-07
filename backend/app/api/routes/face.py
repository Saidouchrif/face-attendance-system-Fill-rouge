# app/api/routes/face.py
from fastapi import APIRouter
from pydantic import BaseModel
import base64, cv2, numpy as np
from app.services.face_training_service import save_sample

router = APIRouter(prefix="/face", tags=["Face"])

class CaptureRequest(BaseModel):
    employe_id: int
    image: str

@router.post("/capture-training")
def capture_training(req: CaptureRequest):
    base64_img = req.image.split(",")[1]
    img_bytes = base64.b64decode(base64_img)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        return {"success": False, "message": "Image invalide (imdecode a échoué)."}

    success, msg = save_sample(req.employe_id, img)
    return {"success": success, "message": msg}
