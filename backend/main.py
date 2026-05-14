from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
import os

# Load .env
load_dotenv()

# Gemini Client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# FastAPI App
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Body
class CodeRequest(BaseModel):
    code: str
    language: str


@app.get("/")
def home():
    return {
        "message": "AI Code Reviewer Running"
    }


@app.post("/review")
def review_code(request: CodeRequest):

    # Empty input check
    if not request.code.strip():
        return {
            "error": "Code input cannot be empty"
        }

    prompt = f"""
You are an expert software engineer and code reviewer.

Review this {request.language} code.

Give response in these sections:

1. Bugs
2. Optimization Issues
3. Readability Improvements
4. Security Issues
5. Final Recommendation

Keep explanations beginner friendly.

Code:
{request.code}
"""

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        print("FULL GEMINI RESPONSE:")
        print(response)

        # SAFER RESPONSE HANDLING
        review_text = ""

        # Try extracting text safely
        if hasattr(response, "text") and response.text:
            review_text = response.text

        # Backup extraction
        elif (
            hasattr(response, "candidates")
            and response.candidates
        ):
            try:
                review_text = (
                    response.candidates[0]
                    .content.parts[0]
                    .text
                )
            except:
                pass

        # Final check
        if not review_text:
            return {
                "error": "Gemini returned empty response"
            }

        return {
            "review": review_text
        }

    except Exception as e:
        print("ERROR:")
        print(str(e))

        return {
            "error": str(e)
        }