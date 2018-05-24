from flask_babel import Babel
from flask_babel import format_datetime


import base64
from PIL import Image, ImageTk

import requests
from PIL import Image
import io
#url = "https://s.yimg.com/os/weather/1.0.1/shadow_icon/60x60/partly_cloudy_night@2x.png"


def  get_slug(text):
    slug = str(text)[:200]+'<br />......And More'
    return slug

def get_rate(rate):
    try:
        r = int(rate)
    except:
        r = 1
    if r == 10:
        return "9_plus"
    return rate

def resize(url):
    r = requests.get(url)
    pilImage = Image.open(io.BytesIO((r.content)))
    p = pilImage.resize((600, 400), Image.ANTIALIAS)
    name = r"/static/img/{}.jpg".format(str(url).split("&")[-1] or url[-1:-5])
    p.save(name)
    return name


babel = Babel()


def my_format_datetime(value, format='medium'):
    if format == 'full':
        format="EEEE, d. MMMM y 'at' HH:mm"
    elif format == 'medium':
        format="EE dd.MM.y HH:mm"
    return format_datetime(value, format)


def format_meta_keywords(tags):
    meta_keywords = 'flask blog'
    if tags:
        meta_keywords = ' '.join(tags).strip()
    return meta_keywords