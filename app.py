import hmac
import os

from static.tools.get_title import get_title
from flask import Flask, jsonify, render_template, request, session

app = Flask(__name__)
app.secret_key = os.environ.get(
    "FLASK_SECRET_KEY",
    "local-development-key-change-before-deploying",
)

LETTERS_QUESTION = os.environ.get(
    "LETTERS_QUESTION",
    "Tin nhắn đầu tiên vào ngày nào? (Dạng: ngày/tháng/năm)",
)
#LETTERS_ANSWER = os.environ.get("LETTERS_ANSWER", "")
LETTERS_ANSWER = "0000"


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
    {"endpoint": "photos", "label": "Ảnh", "path": "/photos"},
    {"endpoint": "videos", "label": "Videos", "path": "/videos"},
    {"endpoint": "events", "label": "Địa Điểm", "path": "/events"},
    {"endpoint": "letters", "label": "Thư", "path": "/letters"},
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
            """Cảm ơn bé vì đã luôn kéo anh khỏi những điều xấu xa của cuộc sống và luôn bên cạnh anh những lúc khó khăn. Anh luôn ghi nhớ những giây phút được ở bên bé. Anh biết là mình vẫn còn nhiều lần vụng về trong lúc mình ở bên nhau, nhưng bé hãy nhớ rằng anh luôn luôn yêu thương và trân trọng bé. Đôi khi anh có lỡ lời hay làm gì có lỗi, đừng vội trách cứ và dỗi hờn anh nhé. Điều anh mong muốn nhất là tình yêu này được bền lâu và anh sẽ luôn bảo vệ nó. Anh sẽ cố gắng để sau này, dù kết quả ra sao thì khi nhìn lại, chúng ta vẫn sẽ thấy tình yêu này thật đẹp đẽ và đáng trân quý.""",
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
    # Optional: Add captions for specific photo numbers; others will simply show without text
    custom_captions = {
        1: "Một ngày đáng nhớ",
        2: "Nơi nào đó với nhau",
        3: "Những điều nhỏ nhặt",
        4: "Chỉ có chúng ta",
    }

    custom_positions = {
        51: "center 20%",
    }

    photo_items = [
        {
            "image": f"img/photos/{i}.jpg",
            "caption": custom_captions.get(i, ""),
            "position": custom_positions.get(i, "center")
        }
        for i in range(1, 66)
    ]

    return render_template(
        "photos.html",
        page_title="Photos",
        photos=photo_items,
        dropbox_url="https://www.dropbox.com/scl/fo/5t5pp6qhoexh7uk2hpdsk/ALILOQJULb6CNrOftuKyLYg?rlkey=1zj1913h1fl48874z09m8rtuu&st=t3pxredn&dl=0",  # Replace with your real Dropbox link
    )


@app.route("/videos")
def videos():
    # Format: (youtube_video_id, orientation, date, title, description)
    # orientation: "vertical" (9:16 phone clip) or "horizontal" (16:9 widescreen)
    raw_videos = [
        ("f1lfO-0BDfs", "horizontal", "05/11/2023", "Mô hình trường cho cô Ly."),
        ("wVJPXL8hokQ", "horizontal", "12/12/2023", "Ngồi học ở Circle K Gia Thụy buồn ngủ vl."),
        ("yfAOhvoB2mo", "horizontal", "21/12/2023", "Xem lại ngại ghê=)))"),
        # ("wlz-3X2ehEQ", "horizontal", "20/11/2026", "Quay quá đẹp."),
        ("iuwGS3F9jfA", "horizontal", "29/07/2024", "Lần đầu thì phải=)))"),
        ("P09cFp5T96k", "horizontal", "23/08/2024", "Có lần đầu thì có lần 2=))"),
        # ("wlz-3X2ehEQ", "horizontal", "20/11/2026", "Quay quá đẹp."),
        ("eZSoS9msm2w", "horizontal", "24/11/2024", "Xong 1 năm."),
        ("2Fl-n5agTLc", "horizontal", "04/09/2025", "Chiếc áo yêu thích, mà chật r."),
        ("hSTOaZQej98", "horizontal", "20/02/2025", "Ảnh đẹp vl toàn lấy làm avt."),
        ("VcAdPgCaMPE", "horizontal", "07/04/2025", "Matcha latte kem muối ngon."),
        ("XwKOItjBXtI", "horizontal", "29/07/2025", "Lắp k lắp cứ ngồi chơi iPad."),
        ("JJrg-xbFKzM", "horizontal", "01/11/2026", "Mặc áo chị Hạnh=)) ngắn vl."),
        ("wlz-3X2ehEQ", "horizontal", "20/11/2026", "Quay quá đẹp."),

        ("mIdSdQW-UFQ", "vertical", "K nhớ ngày nào", "=)))))"),
        # ("wlz-3X2ehEQ", "vertical", "20/11/2026", "Quay quá đẹp."),
        # ("wlz-3X2ehEQ", "vertical", "20/11/2026", "Quay quá đẹp."),
        # ("wlz-3X2ehEQ", "vertical", "20/11/2026", "Quay quá đẹp."),
        # ("wlz-3X2ehEQ", "vertical", "20/11/2026", "Quay quá đẹp."),
        # ("wlz-3X2ehEQ", "vertical", "20/11/2026", "Quay quá đẹp."),
    ]

    all_videos = [
        {
            "number": f"#{idx:02d}",
            "orientation": orientation,
            "date": date,
            "title": get_title(vid_id),
            "description": desc,
            "type": "embed",
            "src": f"https://www.youtube.com/embed/{vid_id}",
            "poster": f"https://i.ytimg.com/vi/{vid_id}/hqdefault.jpg",
        }
        for idx, (vid_id, orientation, date, desc) in enumerate(raw_videos, start=1)
    ]

    horizontal_videos = [v for v in all_videos if v["orientation"] == "horizontal"]
    vertical_videos = [v for v in all_videos if v["orientation"] == "vertical"]

    return render_template(
        "videos.html",
        page_title="Replaying",
        horizontal_videos=horizontal_videos,
        vertical_videos=vertical_videos,
        total_count=len(all_videos),
    )


@app.route("/events")
def events():
    milestones = [
        {
            "number": "01",
            "location": "Bồ Đề",
            "title": "Bánh tráng Khánh Bếu",
            "image": "img/events/khanhbeu.jpg",
        },
        {
            "number": "02",
            "location": "Hà Nội",
            "title": "Circle K",
            "image": "img/events/cck.jpg",
        },
        {
            "number": "03",
            "location": "Tình Quang",
            "title": "Nhà Ngân",
            "image": "img/events/nhangan.jpg",
        },
        {
            "number": "04",
            "location": "Hà Nội",
            "title": "Mixue",
            "image": "img/events/mixue.jpg",
        },
        {
            "number": "05",
            "location": "THPT Nguyễn Gia Thiều",
            "title": "Trường",
            "image": "img/events/c3.jpg",
        },
        {
            "number": "06",
            "location": "Gia Thụy",
            "title": "Tượng đài Gia Thụy",
            "image": "img/events/tuongdaigthuy.jpg",
        },
        {
            "number": "07",
            "location": "Tràng Tiền",
            "title": "Bảo tàng Lịch sử Quốc Gia",
            "image": "img/events/baotanglsqg.jpg",
        },
        {
            "number": "08",
            "location": "Ngọc Thụy",
            "title": "Công viên Ngọc Thụy",
            "image": "img/events/cvienngocthuy.jpg",
        },
        {
            "number": "09",
            "location": "Ngọc Thụy",
            "title": "Dưới nhà Kiệt",
            "image": "img/events/cotdien.jpg",
        },
        {
            "number": "10",
            "location": "Long Biên",
            "title": "AEON Mall Long Biên",
            "image": "img/events/aeon.jpg",
        },
        {
            "number": "11",
            "location": "Ngọc Thụy",
            "title": "Đê Ngọc Thụy",
            "image": "img/events/dengocthuy.jpg",
        },
        {
            "number": "12",
            "location": "Thái Nguyên",
            "title": "Thái Hải",
            "image": "img/events/thaihai.jpg",
        },
        {
            "number": "13",
            "location": "Tây Hồ",
            "title": "Buffet Sen Tây Hồ",
            "image": "img/events/sentayho.jpg",
        },
        {
            "number": "14",
            "location": "Hà Nội",
            "title": "Photobooth (Nhiều lắm)",
            "image": "img/events/ptb.jpg",
        },
        {
            "number": "15",
            "location": "Hai Bà Trưng",
            "title": "The Coffee House",
            "image": "img/events/thecoffeehouse.jpg",
        },
        {
            "number": "16",
            "location": "Mai Châu",
            "title": "Bản Lác",
            "image": "img/events/banlac.jpg",
        },
        {
            "number": "17",
            "location": "Giảng Võ",
            "title": "Umai29",
            "image": "img/events/umai29.jpg",
        },
    ]

    return render_template(
        "events.html",
        page_title="Places",
        milestones=milestones,
    )


@app.route("/letters", methods=["GET", "POST"])
def letters():
    error = None

    if request.method == "POST":
        data = request.get_json(silent=True) or request.form
        answer = (data.get("answer") or "").strip().casefold()
        expected_answer = LETTERS_ANSWER.strip().casefold()

        if expected_answer and hmac.compare_digest(answer, expected_answer):
            session["letters_unlocked"] = True
        else:
            error = "Thế thì chịu."

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            if session.get("letters_unlocked"):
                return jsonify({"unlocked": True})
            return jsonify({"unlocked": False, "error": error}), 400

    return render_template(
        "letters.html",
        page_title="Letters",
        letters_unlocked=session.get("letters_unlocked", False),
        letters_question=LETTERS_QUESTION,
        error=error,
    )


if __name__ == "__main__":
    app.run(debug=True)
