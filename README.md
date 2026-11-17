# Our anniversary website

A small Flask website for sharing three years of memories together.

## Run it locally

From the project folder in PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Open <http://127.0.0.1:5000> in your browser.

## Where to edit

- `templates/`: page content and HTML structure
- `static/css/style.css`: colors, spacing, typography, and responsive layout
- `static/img/`: add image files here later
- `static/videos/`: add small video files here later
- The second-anniversary slideshow currently uses selected files from
  `static/img/`; change the `slideshow` list in `app.py` to select other photos.
- `app.py`: page routes

The site currently uses placeholder content and media blocks. Replace those gradually
as the story develops.

## Locking the letters page

Set these environment variables before starting Flask. Do not commit the answer
or your production secret key to GitHub:

```powershell
$env:LETTERS_QUESTION = "What is the date that started our story?"
$env:LETTERS_ANSWER = "your-answer-here"
$env:FLASK_SECRET_KEY = "a-long-random-secret"
python app.py
```

The answer ignores leading/trailing spaces and letter case. The unlock is stored
in the visitor's Flask session, so it remains unlocked while that browser session
is active.
