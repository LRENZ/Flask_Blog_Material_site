from flask import Markup, url_for, request
from flask_babel import Babel
from flask_babel import format_datetime


def get_slug(text):
    slug = str(text)[:200] + '<br />......And More'
    return slug


def get_rate(rate):
    rate_dict = {
        '10': "Stunning Groundbreaking & Incredible,Masterpiece",
        "9": "Everyone Bow Down, Can Not Be Better",
        "8": "Amazing,Fantastic,Enjoyable Experience",
        "7": "Funny & Interesting",
        "6": "Wasn't Hoping For Much",
        "5": "Got Better Choice",
        "4": "Wasting Time",
        "3": "Disaster",
        "2": "Disaster",
        "1": "Disaster",
    }
    try:
        r = str(rate)
    except:
        r = "1"
    return Markup("<h4 > <strong>{} </strong>: <span class = 'blue-text flow-text'><strong>{} </strong></span></h4> ".format(rate, rate_dict[r]))


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
        format = "EEEE, d. MMMM y 'at' HH:mm"
    elif format == 'medium':
        format = "EE dd.MM.y HH:mm"
    return format_datetime(value, format)


def format_meta_keywords(tags):
    meta_keywords = 'flask blog'
    if tags:
        meta_keywords = ' '.join(tags).strip()
    return meta_keywords


def get_clean_tag(tag):
    tag = str(tag)
    try:
        t = tag.split('_')
        return t[0]
    except:
        pass


def get_header_title(title):
    try:
        t = str(title).strip().split(r'/')
        ti = [x for x in t if len(x) > 4]
        return ti[0]
    except:
        return "LRENZ-Linpiner.com"


def remove_slash(title):
    try:
        t = str(title).strip().replace('/', '')
        if t:
            return t
        else:
            return "LRENZ"
    except:
        return "LRENZ"


def get_words(word):
     lst = str(word).split('&')
     b = [lst[i:i + 3] for i in range(0, len(lst), 3)]
     return b

def revword(word):
    w = str(word).split('=')[1]
    return w
