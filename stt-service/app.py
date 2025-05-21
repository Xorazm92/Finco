from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import whisper_s2t
import uvicorn
import os
import tempfile
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(
    title="WhisperS2T STT Service",
    description="Microservice for converting audio to text using WhisperS2T.",
    version="1.0.0"
)

WHISPER_MODEL_IDENTIFIER = os.getenv("WHISPER_MODEL_IDENTIFIER", "small")
WHISPER_BACKEND = os.getenv("WHISPER_BACKEND", "CTranslate2")

model = None
try:
    logger.info(f"Loading WhisperS2T model: {WHISPER_MODEL_IDENTIFIER} with backend {WHISPER_BACKEND}...")
    model = whisper_s2t.load_model(
        model_identifier=WHISPER_MODEL_IDENTIFIER,
        backend=WHISPER_BACKEND,
    )
    logger.info("WhisperS2T model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load WhisperS2T model: {e}", exc_info=True)

class TranscriptionResult(BaseModel):
    text: str
    start_time: float
    end_time: float

@app.post("/transcribe", response_model=TranscriptionResult)
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    lang_code: str = "auto",
    task: str = "transcribe",
    initial_prompt: str = None,
):
    if model is None:
        raise HTTPException(status_code=503, detail="Speech-to-Text model is not loaded or ready.")

    if audio_file.content_type not in ["audio/mpeg", "audio/wav", "audio/ogg", "audio/opus", "audio/aac"]:
        raise HTTPException(status_code=400, detail="Invalid audio file format. Only MP3, WAV, OGG, OPUS, AAC are supported.")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            content = await audio_file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        logger.info(f"Received audio file: {audio_file.filename}, size: {len(content)} bytes, path: {tmp_file_path}")

        files = [tmp_file_path]
        lang_codes = [lang_code] if lang_code != "auto" else [None]
        tasks = [task]
        initial_prompts = [initial_prompt] if initial_prompt else [None]

        out = model.transcribe_with_vad(
            files,
            lang_codes=lang_codes,
            tasks=tasks,
            initial_prompts=initial_prompts,
            batch_size=os.cpu_count() * 2
        )

        if out and out[0]:
            full_text = " ".join([segment['text'] for segment in out[0]])
            start_time = out[0][0]['start_time'] if out[0] else 0.0
            end_time = out[0][-1]['end_time'] if out[0] else 0.0

            logger.info(f"Transcription successful for {audio_file.filename}: {full_text[:50]}...")
            return TranscriptionResult(text=full_text, start_time=start_time, end_time=end_time)
        else:
            raise HTTPException(status_code=500, detail="Transcription returned no output.")

    except Exception as e:
        logger.error(f"Error during transcription: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")
    finally:
        if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)
            logger.info(f"Removed temporary file: {tmp_file_path}")

@app.get("/health")
async def health_check():
    if model:
        return {"status": "ok", "model_loaded": True, "model_identifier": WHISPER_MODEL_IDENTIFIER}
    return {"status": "degraded", "model_loaded": False}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("STT_SERVICE_PORT", 8000)))
