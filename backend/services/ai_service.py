from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def review_code_logic(code: str, language: str):

    prompt = f"""
    You are an expert software engineer.

    Review this {language} code.

    Analyze:
    - Bugs
    - Optimization
    - Readability
    - Security

    Code:
    {code}
    """

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )

        return {
            "review": response.text
        }

    except Exception as e:

        return {
            "error": str(e)
        }