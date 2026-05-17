import subprocess
import tempfile
import os
import uuid


LANGUAGE_CONFIG = {

    "Python": {
        "image": "python:3.11",
        "filename": "code.py",
        "command": [
            "python",
            "/app/code.py"
        ]
    },

    "JavaScript": {
        "image": "node:20",
        "filename": "code.js",
        "command": [
            "node",
            "/app/code.js"
        ]
    },

    "Java": {
        "image": "eclipse-temurin:21",
        "filename": "Main.java",
        "command": [
            "sh",
            "-c",
            "javac /app/Main.java && java -cp /app Main"
        ]
    },

    "C++": {
        "image": "gcc:13",
        "filename": "main.cpp",
        "command": [
            "sh",
            "-c",
            "g++ /app/main.cpp -o /app/a.out && /app/a.out"
        ]
    }
}


def execute_code_logic(code: str, language: str):

    container_name = f"sandbox_{uuid.uuid4().hex[:8]}"

    try:

        if language not in LANGUAGE_CONFIG:

            return {
                "error": "Language not supported yet"
            }

        config = LANGUAGE_CONFIG[language]

        with tempfile.TemporaryDirectory() as temp_dir:

            file_path = os.path.join(
                temp_dir,
                config["filename"]
            )

            with open(
                file_path,
                "w",
                encoding="utf-8"
            ) as f:

                f.write(code)

            docker_command = [

                "docker",
                "run",

                "--name",
                container_name,

                "--rm",

                "--network",
                "none",

                "--memory",
                "256m",

                "--cpus",
                "1",

                "-v",
                f"{temp_dir}:/app",

                config["image"],

                *config["command"]
            ]

            result = subprocess.run(

                docker_command,

                capture_output=True,
                text=True,
                timeout=5
            )

            output = (
                result.stdout or
                result.stderr or
                "No output"
            )

            return {
                "output": output
            }

    except subprocess.TimeoutExpired:

        subprocess.run(
            [
                "docker",
                "kill",
                container_name
            ],
            capture_output=True
        )

        return {
            "error": "Code execution timed out"
        }

    except Exception as e:

        return {
            "error": str(e)
        }

    finally:

        subprocess.run(
            [
                "docker",
                "rm",
                "-f",
                container_name
            ],
            capture_output=True
        )