from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
import uuid, os, cv2, numpy as np
from deepface import DeepFace

from app.db.session import SessionLocal
from app.core.deps import get_db
from app.models.presence import Presence
from app.models.employee import Employe
from app.models.face_template import FaceTemplate
from app.services.presence_service import record_check_in, record_check_out

router = APIRouter(prefix="/api/presence", tags=["Presence"])

STORAGE_DIR = "storage/presence_tmp"
os.makedirs(STORAGE_DIR, exist_ok=True)


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


@router.post("/check-in")
async def check_in_with_face(image: UploadFile = File(...)):
    """
    Record employee check-in using face recognition
    """
    db = SessionLocal()
    
    try:
        # 1) Save temp image
        img_bytes = await image.read()
        img_name = f"{uuid.uuid4()}.jpg"
        img_path = os.path.join(STORAGE_DIR, img_name)
        
        with open(img_path, "wb") as f:
            f.write(img_bytes)
        
        # 2) Extract embedding from uploaded image
        try:
            result = DeepFace.represent(
                img_path=img_path,
                model_name="Facenet",
                enforce_detection=False
            )
            input_embedding = np.array(result[0]["embedding"])
        except Exception as e:
            return {
                "success": False,
                "message": f"Erreur de détection du visage: {str(e)}"
            }
        
        # 3) Load all active face templates from DB
        templates = db.query(FaceTemplate).filter(FaceTemplate.is_active == True).all()
        
        if not templates:
            return {
                "success": False,
                "message": "Aucun modèle de reconnaissance faciale enregistré"
            }
        
        best_score = -1
        best_employee_id = None
        
        # 4) Compare with all templates
        for t in templates:
            try:
                emb = np.load(t.encoding_path)
                score = cosine_similarity(input_embedding, emb)
                
                if score > best_score:
                    best_score = score
                    best_employee_id = t.employe_id
            except:
                continue
        
        # 5) Check threshold (cosine > 0.70 = match)
        if best_score < 0.70:
            return {
                "success": False,
                "message": "Visage non reconnu. Veuillez contacter l'administration.",
                "confidence": round(best_score * 100, 2)
            }
        
        # 6) Get employee info
        employee = db.query(Employe).filter(Employe.id == best_employee_id).first()
        
        if not employee:
            return {
                "success": False,
                "message": "Employé non trouvé dans la base de données"
            }
        
        # 7) Record check-in
        presence, error = record_check_in(
            db,
            employe_id=best_employee_id,
            face_confidence=best_score,
            device_name="Web Camera"
        )
        
        if error:
            return {
                "success": False,
                "message": error
            }
        
        # 8) Return success with employee info
        return {
            "success": True,
            "message": f"Entrée enregistrée avec succès à {presence.check_in_time.strftime('%H:%M:%S')}",
            "employee": {
                "id": employee.id,
                "matricule": employee.matricule,
                "first_name": employee.first_name,
                "last_name": employee.last_name,
                "poste": employee.poste,
                "departement": employee.departement
            },
            "presence": {
                "id": presence.id,
                "check_in_time": presence.check_in_time.strftime("%H:%M:%S"),
                "status": presence.status,
                "date": presence.jour.strftime("%Y-%m-%d")
            },
            "confidence": round(best_score * 100, 2)
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Erreur système: {str(e)}"
        }
    finally:
        db.close()
        # Clean up temp file
        if os.path.exists(img_path):
            try:
                os.remove(img_path)
            except:
                pass


@router.post("/check-out")
async def check_out_with_face(image: UploadFile = File(...)):
    """
    Record employee check-out using face recognition
    """
    db = SessionLocal()
    
    try:
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
            return {
                "success": False,
                "message": f"Erreur de détection du visage: {str(e)}"
            }
        
        # 3) Load all active templates
        templates = db.query(FaceTemplate).filter(FaceTemplate.is_active == True).all()
        
        if not templates:
            return {
                "success": False,
                "message": "Aucun modèle de reconnaissance faciale enregistré"
            }
        
        best_score = -1
        best_employee_id = None
        
        # 4) Compare with all templates
        for t in templates:
            try:
                emb = np.load(t.encoding_path)
                score = cosine_similarity(input_embedding, emb)
                
                if score > best_score:
                    best_score = score
                    best_employee_id = t.employe_id
            except:
                continue
        
        # 5) Check threshold
        if best_score < 0.70:
            return {
                "success": False,
                "message": "Visage non reconnu. Veuillez contacter l'administration.",
                "confidence": round(best_score * 100, 2)
            }
        
        # 6) Get employee info
        employee = db.query(Employe).filter(Employe.id == best_employee_id).first()
        
        if not employee:
            return {
                "success": False,
                "message": "Employé non trouvé dans la base de données"
            }
        
        # 7) Record check-out
        presence, error = record_check_out(
            db,
            employe_id=best_employee_id,
            face_confidence=best_score,
            device_name="Web Camera"
        )
        
        if error:
            return {
                "success": False,
                "message": error
            }
        
        # 8) Return success
        return {
            "success": True,
            "message": f"Sortie enregistrée avec succès à {presence.check_out_time.strftime('%H:%M:%S')}",
            "employee": {
                "id": employee.id,
                "matricule": employee.matricule,
                "first_name": employee.first_name,
                "last_name": employee.last_name,
                "poste": employee.poste,
                "departement": employee.departement
            },
            "presence": {
                "id": presence.id,
                "check_in_time": presence.check_in_time.strftime("%H:%M:%S") if presence.check_in_time else None,
                "check_out_time": presence.check_out_time.strftime("%H:%M:%S"),
                "status": presence.status,
                "date": presence.jour.strftime("%Y-%m-%d")
            },
            "confidence": round(best_score * 100, 2)
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Erreur système: {str(e)}"
        }
    finally:
        db.close()
        # Clean up temp file
        if os.path.exists(img_path):
            try:
                os.remove(img_path)
            except:
                pass


@router.get("/list")
def get_all_presences(db: Session = Depends(get_db)):
    """
    Get all presences with employee information
    """
    try:
        presences = db.query(Presence).order_by(Presence.jour.desc(), Presence.check_in_time.desc()).limit(100).all()
        
        result = []
        for p in presences:
            employee = db.query(Employe).filter(Employe.id == p.employe_id).first()
            if employee:
                result.append({
                    "id": p.id,
                    "date": p.jour.strftime("%Y-%m-%d"),
                    "check_in_time": p.check_in_time.strftime("%H:%M:%S") if p.check_in_time else None,
                    "check_out_time": p.check_out_time.strftime("%H:%M:%S") if p.check_out_time else None,
                    "status": p.status,
                    "source": p.source,
                    "confidence": round(p.face_confidence * 100, 2) if p.face_confidence else None,
                    "employee": {
                        "id": employee.id,
                        "matricule": employee.matricule,
                        "first_name": employee.first_name,
                        "last_name": employee.last_name,
                        "poste": employee.poste,
                        "departement": employee.departement
                    }
                })
        
        return {
            "success": True,
            "presences": result,
            "total": len(result)
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Erreur: {str(e)}"
        }
