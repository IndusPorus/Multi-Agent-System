import requests

from utils.language_map import LANGUAGE_MAP

PISTON_URL = "https://emkc.org/api/v2/piston/execute"


def execute_code_logic(code: str, language: str):

    piston_language = LANGUAGE_MAP.get(language)

    if not piston_language:
        return {
            "error": f"Unsupported language: {language}"
        }

    payload = {
        "language": piston_language,
        "version": "*",
        "files": [
            {
                "name": f"main.{piston_language}",
                "content": code
            }
        ],
        "stdin": "",
        "args": [],
        "compile_timeout": 10000,
        "run_timeout": 3000
    }

    try:

        response = requests.post(
            PISTON_URL,
            json=payload,
            timeout=15
        )

        data = response.json()

        print("PISTON RESPONSE:")
        print(data)

        run_data = data.get("run", {})

        stdout = run_data.get("stdout", "")
        stderr = run_data.get("stderr", "")

        combined_output = stdout + stderr

        return {
            "output": combined_output.strip(),
            "stdout": stdout,
            "stderr": stderr,
            "code": run_data.get("code", 0)
        }

    except Exception as e:

        return {
            "error": str(e)
        }