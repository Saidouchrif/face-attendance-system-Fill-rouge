from threading import Lock

_facenet_model = None
_model_lock = Lock()


def _import_deepface():
    from deepface import DeepFace

    return DeepFace


def get_deepface_module():
    """
    Lazily import DeepFace so TensorFlow is only touched inside face workflows.
    """
    return _import_deepface()


def load_facenet_model():
    """
    Lazily build the Facenet model the first time a face route needs it.
    This avoids loading TensorFlow during unrelated endpoints like /auth/login.
    """
    global _facenet_model
    if _facenet_model is not None:
        return _facenet_model

    with _model_lock:
        if _facenet_model is None:
            DeepFace = get_deepface_module()
            _facenet_model = DeepFace.build_model("Facenet")
    return _facenet_model


def get_facenet_model():
    if _facenet_model is None:
        return load_facenet_model()
    return _facenet_model
