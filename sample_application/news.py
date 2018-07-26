from flask import Blueprint, render_template, redirect, url_for

news = Blueprint('news', __name__)
from .model import *
from flask_login import current_user


@news.route('/news')
@news.route('/news/<int:page>')
def review_list(page=1):
    # image = 'images/coffee.jpg'
    # search_code = Code.objects( Q(published =True) & Q(category = 'google_customs_search_js')).first() or "something wrong"
    post = Info.objects(done=True).paginate(page=page, per_page=8)
    return render_template("news_nav.html", post=post, user=current_user)


@news.route('/news/<string:post_title>')
def get_post(post_title):
    post = Info.objects.get_or_404(title__contains=post_title)
    return render_template("news.html", post=post, user=current_user)


@news.route('/news_tag/<string:id>')
def view_tag_tags(id, page=1):
    # image = 'images/coffee.jpg'
    tags_post = Tag.objects(cata='Post')
    tags_reviews = Tag.objects(cata='Reviews')
    tags_news = Tag.objects(cata='News')
    post = Info.objects(done=True).filter(tags__in=[id])
    i = Image.objects(to_pub=True)[:3]
    tag = Tag.objects(id=id).first()
    # paginated_tags = post.paginate_field('tags', page=1, per_page=5)
    return render_template("news_tag.html", paginated_tags=post, image=i, tags_post=tags_post, tags_news=tags_news,
                           tags_reviews=tags_reviews, tag=tag, user=current_user)
