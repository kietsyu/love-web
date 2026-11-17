import hmac
import os

from flask import Flask, render_template, request, session

app = Flask(__name__)
app.secret_key = os.environ.get(
    "FLASK_SECRET_KEY",
    "local-development-key-change-before-deploying",
)

LETTERS_QUESTION = os.environ.get(
    "LETTERS_QUESTION",
    "Tin nhắn đầu tiên vào ngày nào? (Dạng: ngày/tháng/năm)",
)
LETTERS_ANSWER = os.environ.get("LETTERS_ANSWER", "29/09/2023")


PAGES = [
    {"endpoint": "home", "label": "Home", "path": "/"},
    {
        "endpoint": "first_anniversary",
        "label": "Một Năm",
        "path": "/first-anniversary",
    },
    {
        "endpoint": "second_anniversary",
        "label": "Hai Năm",
        "path": "/second-anniversary",
    },
    {"endpoint": "photos", "label": "Photos", "path": "/photos"},
    {"endpoint": "videos", "label": "Videos", "path": "/videos"},
    {"endpoint": "events", "label": "Events", "path": "/events"},
    {"endpoint": "letters", "label": "Letters", "path": "/letters"},
]


@app.context_processor
def inject_navigation():
    return {"pages": PAGES}


@app.route("/")
def home():
    return render_template("home.html", page_title="Three years, and counting")


@app.route("/first-anniversary")
def first_anniversary():
    return render_template(
        "anniversary.html",
        page_title="Our first anniversary",
        eyebrow="Chương một",
        heading="The beginning of everything",
        intro="Add the story of your first year together here.",
        year="Một",
    )


@app.route("/second-anniversary")
def second_anniversary():
    return render_template(
        "anniversary.html",
        page_title="Our second anniversary",
        eyebrow="Chương hai",
        heading="Hai năm của chúng ta",
        intro="Một vài khoảnh khắc đẹp nhất của năm thứ hai.",
        year="Hai",
        slideshow=[
            {
                "image": "img/anni2/1.jpg",
            },
            {
                "image": "img/anni2/2.jpg",
            },
            {
                "image": "img/anni2/3.jpg",
            },
            {
                "image": "img/anni2/4.jpg",
            },
            {
                "image": "img/anni2/5.jpg",
            },
            {
                "image": "img/anni2/6.jpg",
            },
            {
                "image": "img/anni2/7.jpg",
            },
            {
                "image": "img/anni2/8.jpg",
            },
            {
                "image": "img/anni2/9.jpg",
            },
            {
                "image": "img/anni2/10.jpg",
            },
            {
                "image": "img/anni2/11.jpg",
            },
            {
                "image": "img/anni2/12.jpg",
            },
            {
                "image": "img/anni2/13.jpg",
            },
            {
                "image": "img/anni2/14.jpg",
            },
            {
                "image": "img/anni2/15.jpg",
            },
            {
                "image": "img/anni2/16.jpg",
            },
            {
                "image": "img/anni2/17.jpg",
            },
            {
                "image": "img/anni2/18.jpg",
            },
            {
                "image": "img/anni2/19.jpg",
            },
            {
                "image": "img/anni2/20.jpg",
            },
            {
                "image": "img/anni2/21.jpg",
            },
            {
                "image": "img/anni2/22.jpg",
            },
            {
                "image": "img/anni2/23.jpg",
            },
            {
                "image": "img/anni2/24.jpg",
            },
            {
                "image": "img/anni2/25.jpg",
            },
            {
                "image": "img/anni2/26.jpg",
            },
            {
                "image": "img/anni2/27.jpg",
            },
            {
                "image": "img/anni2/28.jpg",
            },
            {
                "image": "img/anni2/29.jpg",
            },
            {
                "image": "img/anni2/30.jpg",
            },
        ],
    )


@app.route("/photos")
def photos():
    return render_template("photos.html", page_title="Our photos")


@app.route("/videos")
def videos():
    return render_template("videos.html", page_title="Our videos")


@app.route("/events")
def events():
    return render_template("events.html", page_title="Places we have been")


@app.route("/letters", methods=["GET", "POST"])
def letters():
    error = None

    if request.method == "POST":
        answer = request.form.get("answer", "").strip().casefold()
        expected_answer = LETTERS_ANSWER.strip().casefold()

        if hmac.compare_digest(answer, expected_answer):
            session["letters_unlocked"] = True
        else:
            error = "Thế thì chịu."

    return render_template(
        "letters.html",
        page_title="Letters and thoughts",
        letters_unlocked=session.get("letters_unlocked", False),
        letters_question=LETTERS_QUESTION,
        error=error,
    )


if __name__ == "__main__":
    app.run(debug=True)
