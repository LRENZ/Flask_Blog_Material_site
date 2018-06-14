from flask_babel import Babel
from flask_babel import format_datetime
from flask import Markup,url_for,request






def  get_slug(text):
    slug = str(text)[:200]+'<br />......And More'
    return slug

def get_rate(rate):

    rate_dict={
        '10':"SO SO... Amazing",
        "9" : "早看早享受",
        "8" : "年度良心剧集",
        "7":   "Enjoy，非常有特点",
        "6" : "应该还有的救",
        "5" : "尽早跳坑",
        "4" :"跳坑",
        "3" : "跳坑",
        "2" : "跳坑",
        "1" : "跳坑",
    }
    try:
        r = str(rate)
    except:
        r = "1"
    return  Markup("<h4 > <strong>{} </strong>: <span class = 'blue-text'>{} </span></h4> ".format(rate,rate_dict[r]))

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
        ti = [x  for x in t if len(x) > 4]
        return ti[0]
    except:
        return "LRENZ-Linpiner.com"

def remove_slash(title):
    try:
        t = str(title).strip().replace('/','')
        if t:
            return t
        else:
            return "LRENZ"
    except:
        return "LRENZ"