from flask_babel import Babel
from flask_babel import format_datetime
import html


def  get_slug(text):
    slug = html.escape(str(text)[:300])+'......'
    return slug

def get_rate(rate):
    try:
        r = int(rate)
    except:
        r = 1
    if r == 10:
        return "9_plus"
    return rate





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