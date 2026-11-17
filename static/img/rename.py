from pathlib import Path

folder = Path("F:\\Code\\Python\\anni3y\\static\\img\\anni2")

i = 1
for count, file in enumerate(sorted(folder.glob("*.jpg")), start=1):
    new = f"{i}{file.suffix}"
    file.rename(folder/new)
    i += 1