import os
import re

ROOT = os.path.join(os.path.dirname(__file__), "..")
TAG = "div"
BAD = "motion"

for dirpath, _, files in os.walk(ROOT):
    if "node_modules" in dirpath or ".next" in dirpath:
        continue
    for name in files:
        if not name.endswith(".tsx"):
            continue
        path = os.path.join(dirpath, name)
        with open(path, encoding="utf-8") as f:
            content = f.read()
        updated = re.sub(rf"</{TAG}>>+", f"</{TAG}>", content)
        updated = updated.replace(f"<{BAD} ", f"<{TAG} ")
        updated = updated.replace(f"<{BAD}>", f"<{TAG}>")
        updated = updated.replace(f"</{BAD}>", f"</{TAG}>")
        if updated != content:
            with open(path, "w", encoding="utf-8") as f:
                f.write(updated)
            print("fixed", path)
