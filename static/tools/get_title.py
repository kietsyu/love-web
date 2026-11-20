import requests

_cache = {}

def get_title(video_id: str) -> str:
    if video_id in _cache:
        return _cache[video_id] #type: ignore

    try:
        res = requests.get(
            "https://www.youtube.com/oembed",
            params={
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "format": "json",
            },
            timeout=5,
        )
        res.raise_for_status()
        title = res.json()["title"]
    except (requests.RequestException, ValueError, KeyError):
        return "Untitled video"

    _cache[video_id] = title
    return title