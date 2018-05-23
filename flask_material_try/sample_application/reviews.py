from flask import Blueprint, render_template, redirect, url_for
rv = Blueprint('reviews', __name__)
from .model import *

@rv.route('/reviews')
@rv.route('/reviews/<int:page>')
def review_list(page=1):
    #image = 'images/coffee.jpg'
    post = Review.objects(status =True).paginate(page=page, per_page=5)
    return render_template("review_nav.html",  post=post)


@rv.route('/reviews/<string:post_title>')
def get_post(post_title):
    post = Review.objects.get_or_404(title__contains=post_title )
    return render_template("reviews.html", post=post)