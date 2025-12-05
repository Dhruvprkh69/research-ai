"""Quick script to check available Gemini models."""
import os
from dotenv import load_dotenv
from pathlib import Path
import google.generativeai as genai

# Load .env from project root
ROOT_DIR = Path(__file__).resolve().parents[1]
env_path = ROOT_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("❌ GOOGLE_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)

print("Checking available models...")
try:
    models = genai.list_models()
    print("\n✅ Available models:")
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            print(f"  - {model.name}")
except Exception as e:
    print(f"❌ Error listing models: {e}")

