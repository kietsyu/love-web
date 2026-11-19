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
LETTERS_ANSWER = os.environ.get("LETTERS_ANSWER", "")


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
    return render_template("home.html", page_title="Home")


@app.route("/first-anniversary")
def first_anniversary():
    custom_positions = {
        1: "center 20%",
        2: "center 20%",
        3: "center 55%",
        7: "center 65%",
        12: "right",
        17: "center 25%",
    }
    first_year_gallery = [
        {
            "image": f"img/anni1/{i}.jpg",
            "caption": "",
            "position": custom_positions.get(i, "center")
        }
        for i in range(1, 21)
    ]

    return render_template(
        "anniversary.html",
        page_title="Year One",
        eyebrow="Chương một • 23/11/2024",
        heading="Sự khởi đầu",
        intro="Một năm trôi qua cùng nhiều cuộc cãi vã về những điều nhỏ nhặt nhưng cũng có rất nhiều khoảnh khắc vui vẻ đã được ghi lại.",
        year="Một",
        gallery=first_year_gallery,
    )


@app.route("/second-anniversary")
def second_anniversary():
    second_year_letter = { #type: ignore
        "label": "Thư • Kỷ niệm 2 năm",
        "heading": "Hai năm trôi qua thật nhanh",
        "paragraphs": [
            """cảm ơn bé vì đã luôn kéo anh khỏi những điều xấu xa của cuộc sống và luôn bên cạnh anh những lúc khó khăn. anh luôn ghi nhớ những giây phút được ở bên bé. anh biết là mình vẫn còn nhiều lần vụng về trong lúc mình ở bên nhau, nhưng bé hãy nhớ rằng anh luôn luôn yêu thương và trân trọng bé. đôi khi anh có lỡ lời hay làm gì có lỗi, đừng vội trách cứ và dỗi hờn anh nhé. điều anh mong muốn nhất là tình yêu này được bền lâu và anh sẽ  luôn bảo vệ nó. anh sẽ cố gắng để sau này, dù kết quả ra sao thì khi nhìn lại, chúng ta vẫn sẽ thấy tình yêu này thật đẹp đẽ và đáng trân quý.""",
        ],
        "signature": "iu,",
    }

    return render_template(
        "anniversary.html",
        page_title="Year Two",
        eyebrow="Chương hai • 23/11/2025",
        heading="Năm thứ hai của chúng ta",
        intro="Trải qua một năm học cách yêu, chúng ta đã nhận ra nhiều điều, từ những sai sót của bản thân, những điều nên làm, cũng như hiểu hơn về con người của bạn đồng hành. Để rồi từ đó, ta bước qua năm thứ hai với sự trưởng thành hơn rất nhiều so với những ngày đầu tiên.",
        year="Hai",
        slideshow=[
            {"image": f"img/anni2/{i}.jpg"}
            for i in range(1, 31)
        ],
        letter=second_year_letter,
    )



@app.route("/photos")
def photos():
    return render_template("photos.html", page_title="Captured")


@app.route("/videos")
def videos():
    return render_template("videos.html", page_title="Replaying")


@app.route("/events")
def events():
    return render_template("events.html", page_title="Places")


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
        page_title="Letters",
        letters_unlocked=session.get("letters_unlocked", False),
        letters_question=LETTERS_QUESTION,
        error=error,
    )


if __name__ == "__main__":
    app.run(debug=True)
