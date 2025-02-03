import os
import dotenv
import google.generativeai as genai


MODEL_NAME = "gemini-1.5-flash"
dotenv.load_dotenv()
genai.configure(api_key=os.getenv("GENAI_API_KEY"))


class Model:
    def __init__(self):
        self.model = None
    def run(self):
        pass
class ModelException(Exception):
    pass


class Speech2TextModel(Model):
    def __init__(self):
        self.model = genai.GenerativeModel(model_name=MODEL_NAME)
    def run(self, audio_bytes: str) -> str:
        try:
            # get prompt
            prompt = """You are a great transcriber and a great chess player.
You must extract and output the chess move said in the audio, in algebraic notation, without any other word.
If there are several moves, or none, or the audio is not clear, then output UNKNOWN."""
            # pass prompt + audio file to model
            response = self.model.generate_content([
                prompt,
                {
                    "mime_type": "audio/mp3",
                    "data": audio_bytes
                }
            ])
            return response.text.strip()
        except Exception as e:
            raise ModelException(e)
