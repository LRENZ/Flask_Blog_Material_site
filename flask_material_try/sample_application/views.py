from flask import Blueprint, render_template, redirect, url_for
from .form import  testForm,SearchForm
bp = Blueprint('blog', __name__)
from .model import *




@bp.route('/')
def index():
    p = Post.objects().first()
    return render_template('index.html',p = p)

@bp.route('/posts')
@bp.route('/posts/<string:post_title>')
def get_post(post_title):
    post = Post.objects.get_or_404(title__contains=post_title)
    return render_template("post.html", post=post)

@bp.route('/readme')
def readme():
    return render_template('readme.html')

@bp.route('/pag')
@bp.route('/pag/<int:page>')
def post_list(page=1):
    #image = 'images/coffee.jpg'
    post = Post.objects.paginate(page=page, per_page=5)
    return render_template("post_nav.html",  post=post)


@bp.route('/tag/<string:tag>')
def view_tag_tags(tag, page=1):
    image = 'images/coffee.jpg'
    post = Post.objects.filter(tags__contains=tag)
    #paginated_tags = post.paginate_field('tags', page=1, per_page=5)
    return render_template("tags.html",image = image,  paginated_tags=post)

@bp.route('/contact')
def contact():
    return render_template("contact.html")


@bp.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404







#################################################################3
##############test router########################################
##################################################################
@bp.route('/post')
def image():
    tags = ['tag1','tag2','tag3']
    content = 'micawber supplies a few methods for retrieving rich metadata about a variety of links'
    return render_template('new_test.html',title = 'title',
                           content = content,
                           image = 'images/coffee.jpg',
                           tags = tags,
                           actions = [['/','test']])

"""
@bp.route('/post')
def image():
    return render_template('new_test.html')
"""




@bp.route('/form')
def testform():
    form = testForm()
    return render_template('test.html',form=form)

@bp.route('/test')
#@bp.route('/posts/<string:post_id>')
def get_post_with():
    post = Post.objects().all()
    return render_template("post_list.html", post=post)





@bp.route('/about')
def about():
    user = User.objects.first()
    return render_template("about.html", user=user)




@bp.route('/detail')
def post():
    post = Post.objects.first()
    return render_template('post.html',post = post)
	
@bp.route('/addcomment')
def comment():
    post = Post.objects.first()
    return render_template('post.html',post = post)



	
