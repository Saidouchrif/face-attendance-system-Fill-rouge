import os
import uuid
import cv2
import numpy as np
from datetime import datetime
from deepface import DeepFace
from app.models.face_template import FaceTemplate
from app.db.session import SessionLocal

STORAGE_DIR = "storage/face_data"


def save_sample(employe_id: int, img_bgr):

    # ------------------ 0) Ensure storage folder exists ------------------
    os.makedirs(STORAGE_DIR, exist_ok=True)

    # ------------------ 1) Save image locally ----------------------------
    img_name = f"{uuid.uuid4()}.jpg"
    img_path = os.path.join(STORAGE_DIR, img_name)
    cv2.imwrite(img_path, img_bgr)

    # ------------------ 2) Extract embedding using DeepFace --------------
    try:
        result = DeepFace.represent(
            img_path=img_path,
            model_name="Facenet",
            enforce_detection=False
        )
        embedding = result[0]["embedding"]

    except Exception as e:
        return False, f"Face embedding error: {str(e)}"

    # ------------------ 3) Save embedding vector in .npy -----------------
    enc_name = f"{uuid.uuid4()}.npy"
    enc_path = os.path.join(STORAGE_DIR, enc_name)

    np.save(enc_path, np.array(embedding))

    # ------------------ 4) Store record in database ----------------------
    db = SessionLocal()

    try:
        tmpl = FaceTemplate(
            employe_id=employe_id,
            image_path=img_path,
            encoding_path=enc_path,
            type="training",
            is_active=True,
            created_at=datetime.utcnow()
        )

        db.add(tmpl)
        db.commit()
        db.refresh(tmpl)

        return True, "Sample saved successfully"

    except Exception as e:
        db.rollback()
        return False, f"Database error: {str(e)}"

    finally:
        db.close()
