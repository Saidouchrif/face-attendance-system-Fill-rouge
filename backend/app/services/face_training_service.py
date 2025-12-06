# app/services/face_training_service.py
import cv2, os, uuid, face_recognition
from app.db.session import SessionLocal
from app.models.face_template import FaceTemplate
from app.models.employee import Employe
import numpy as np

SAVE_DIR = "storage/faces"

os.makedirs(SAVE_DIR, exist_ok=True)

def save_sample(employe_id: int, img):
    session = SessionLocal()

    # 1. استخراج encoding
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    encodings = face_recognition.face_encodings(rgb_img)

    if len(encodings) == 0:
        return False, "Face not detected"

    encoding = encodings[0]

    # 2. حفظ الصورة
    filename = f"{uuid.uuid4()}.jpg"
    filepath = os.path.join(SAVE_DIR, filename)
    cv2.imwrite(filepath, img)

    # 3. حفظ encoding
    encoding_path = filepath.replace(".jpg", ".npy")
    np.save(encoding_path, encoding)

    # 4. تخزين DB
    template = FaceTemplate(
        employe_id=employe_id,
        image_path=filepath,
        encoding_path=encoding_path
    )
    session.add(template)

    # 5. تحديث employee
    emp = session.query(Employe).get(employe_id)
    emp.has_face_profile = True
    emp.face_samples_count += 1

    session.commit()

    return True, "Sample saved successfully"
