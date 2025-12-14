from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import uuid, os
import numpy as np
from deepface import DeepFace
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.deps import get_db, get_current_admin
from app.models.face_template import FaceTemplate
from app.models.employee import Employe
from app.services.employe_service import get_employee_model_info
import cv2

router = APIRouter(prefix="/api", tags=["Recognition"])

STORAGE_DIR = "storage/recognition_tmp"
os.makedirs(STORAGE_DIR, exist_ok=True)


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


@router.post("/recognize-face")
async def recognize_face(image: UploadFile = File(...)):
    # 1) Save temp image
    img_bytes = await image.read()
    img_name = f"{uuid.uuid4()}.jpg"
    img_path = os.path.join(STORAGE_DIR, img_name)

    with open(img_path, "wb") as f:
        f.write(img_bytes)

    # 2) Extract embedding
    try:
        result = DeepFace.represent(
            img_path=img_path,
            model_name="Facenet",
            enforce_detection=False
        )
        input_embedding = np.array(result[0]["embedding"])
    except Exception as e:
        return {"success": False, "message": f"Embedding error: {str(e)}"}

    # 3) Load all embeddings from DB
    db = SessionLocal()
    templates = db.query(FaceTemplate).filter(FaceTemplate.is_active == True).all()

    best_score = -1
    best_employee = None

    for t in templates:
        try:
            emb = np.load(t.encoding_path)
            score = cosine_similarity(input_embedding, emb)

            if score > best_score:
                best_score = score
                best_employee = t.employe_id

        except:
            continue

    # 4) Threshold (cosine > 0.7 = match)
    if best_score < 0.70:
        return {"success": False, "message": "Face not recognized"}

    # 5) Return employee data
    emp = db.query(Employe).filter(Employe.id == best_employee).first()

    return {
        "success": True,
        "employee": {
            "id": emp.id,
            "matricule": emp.matricule,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "email": emp.email,
            "phone": emp.phone,
            "poste": emp.poste,
            "departement": emp.departement
        },
        "confidence": round(best_score * 100, 2)
    }


@router.get("/face/model-info/{employee_id}")
def get_model_info_endpoint(
    employee_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    """
    Get face recognition model information for a specific employee
    """
    model_info = get_employee_model_info(db, employee_id)
    if model_info is None:
        raise HTTPException(status_code=404, detail="Employee not found or no face profile")
    return model_info
