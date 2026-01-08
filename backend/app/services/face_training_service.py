import os
import uuid
import cv2
import numpy as np
from datetime import datetime
from deepface import DeepFace
from app.models.face_template import FaceTemplate
from app.models.employee import Employe
from app.db.session import SessionLocal

BASE_DIR = "storage/face_data"


def save_sample(employe_id: int, img_bgr):

    db = SessionLocal()

    # ------------------ 0) Get employee info ------------------
    emp = db.query(Employe).filter(Employe.id == employe_id).first()
    if not emp:
        db.close()
        return False, "Employee not found"

    # Folder name format: First_Last (no spaces)
    folder_name = f"{emp.first_name}_{emp.last_name}".replace(" ", "")
    employee_dir = os.path.join(BASE_DIR, folder_name)

    # Create employee directory if not exists
    os.makedirs(employee_dir, exist_ok=True)

    # ------------------ 1) Save image -------------------------
    img_name = f"{uuid.uuid4()}.jpg"
    img_path = os.path.join(employee_dir, img_name)
    #save image format jpg
    cv2.imwrite(img_path, img_bgr)

    # ------------------ 2) Extract embedding ------------------
    try:
        result = DeepFace.represent(
            img_path=img_path,
            model_name="Facenet",
            enforce_detection=False
        )
        embedding = result[0]["embedding"]

    except Exception as e:
        db.close()
        return False, f"Face embedding error: {str(e)}"

    # ------------------ 3) Save embedding (.npy) --------------
    enc_name = f"{uuid.uuid4()}.npy"
    enc_path = os.path.join(employee_dir, enc_name)
    np.save(enc_path, np.array(embedding))

    # ------------------ 4) Insert into DB ---------------------
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

        # Update employee stats
        emp.has_face_profile = 1
        emp.face_samples_count = (emp.face_samples_count or 0) + 1
        emp.last_face_training_at = datetime.utcnow()

        db.commit()
        db.refresh(tmpl)

        return True, "Sample saved successfully"

    except Exception as e:
        db.rollback()
        return False, f"Database error: {str(e)}"

    finally:
        db.close()
