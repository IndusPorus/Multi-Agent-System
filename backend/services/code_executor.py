import subprocess
import tempfile
import os


def execute_code_logic(code: str, language: str):

    try:

        # PYTHON
        if language == "Python":

            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=".py",
                mode="w"
            ) as temp:

                temp.write(code)
                temp_path = temp.name

            result = subprocess.run(
                ["python", temp_path],
                capture_output=True,
                text=True,
                timeout=5
            )

            os.remove(temp_path)

            output = result.stdout or result.stderr

            return {
                "output": output
            }

        # JAVASCRIPT
        elif language == "JavaScript":

            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=".js",
                mode="w"
            ) as temp:

                temp.write(code)
                temp_path = temp.name

            result = subprocess.run(
                ["node", temp_path],
                capture_output=True,
                text=True,
                timeout=5
            )

            os.remove(temp_path)

            output = result.stdout or result.stderr

            return {
                "output": output
            }

        # JAVA
        elif language == "Java":

            temp_dir = tempfile.mkdtemp()

            java_file = os.path.join(
                temp_dir,
                "Main.java"
            )

            with open(java_file, "w") as f:
                f.write(code)

            compile_result = subprocess.run(
                ["javac", java_file],
                capture_output=True,
                text=True,
                timeout=5
            )

            if compile_result.stderr:
                return {
                    "output": compile_result.stderr
                }

            run_result = subprocess.run(
                ["java", "-cp", temp_dir, "Main"],
                capture_output=True,
                text=True,
                timeout=5
            )

            output = (
                run_result.stdout or
                run_result.stderr
            )

            return {
                "output": output
            }

        # C++
        elif language == "C++":

            temp_dir = tempfile.mkdtemp()

            cpp_file = os.path.join(
                temp_dir,
                "main.cpp"
            )

            exe_file = os.path.join(
                temp_dir,
                "main.exe"
            )

            with open(cpp_file, "w") as f:
                f.write(code)

            compile_result = subprocess.run(
                ["g++", cpp_file, "-o", exe_file],
                capture_output=True,
                text=True,
                timeout=10
            )

            if compile_result.stderr:
                return {
                    "output": compile_result.stderr
                }

            run_result = subprocess.run(
                [exe_file],
                capture_output=True,
                text=True,
                timeout=5
            )

            output = (
                run_result.stdout or
                run_result.stderr
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