import subprocess
import tempfile
import os


def execute_code_logic(code: str, language: str):

    try:

        # PYTHON DOCKER SANDBOX
        if language == "Python":

            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=".py",
                mode="w",
                encoding="utf-8"
            ) as temp:

                temp.write(code)

                temp_path = os.path.abspath(temp.name)

            result = subprocess.run(

                [
                    "docker",
                    "run",
                    "--rm",

                    # SECURITY LIMITS
                    "--network",
                    "none",

                    "--memory",
                    "256m",

                    "--cpus",
                    "1",

                    # MOUNT CODE FILE
                    "-v",
                    f"{temp_path}:/app/code.py",

                    # PYTHON IMAGE
                    "python:3.11",

                    # EXECUTE FILE
                    "python",
                    "/app/code.py"
                ],

                capture_output=True,
                text=True,
                timeout=5
            )

            # DELETE TEMP FILE
            os.remove(temp_path)

            output = (
                result.stdout or
                result.stderr
            )

            return {
                "output": output
            }

        else:

            return {
                "error": "Language not supported yet"
            }

    except subprocess.TimeoutExpired:

        return {
            "error": "Code execution timed out"
        }

    except Exception as e:

        return {
            "error": str(e)
        }