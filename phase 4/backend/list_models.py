"""Script to list available Cohere models."""

import os
import cohere
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("COHERE_API_KEY")
if not api_key:
    print("Error: COHERE_API_KEY not found")
    exit(1)

co = cohere.Client(api_key=api_key)

try:
    # List all available models
    models = co.models.list()

    print("Available Cohere Models:")
    print("=" * 60)

    for model in models.models:
        print(f"\nModel: {model.name}")
        if hasattr(model, 'endpoints'):
            print(f"  Endpoints: {model.endpoints}")
        if hasattr(model, 'description'):
            print(f"  Description: {model.description}")

except Exception as e:
    print(f"Error listing models: {e}")
