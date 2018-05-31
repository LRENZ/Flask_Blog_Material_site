from flask import Blueprint, render_template, redirect, url_for,flash
from .form import ContactForm
bp = Blueprint('blog', __name__)
from .model import *
from .model import Contact as cn
from datetime import datetime
#from .form import photos
from werkzeug import secure_filename
#from mongoengine.queryset.visitor import Q
from jinja2 import utils




@bp.route('/')
def index():
    p = Post.objects(status =True)[:3]
    r = Review.objects(status =True)[:3]
    t = Info.objects(done =True)[:3]
    i = Image.objects(to_pub=True)[:3]

    return render_template('index.html',post = p,reviews = r,todo =t, image = i)

@bp.route('/contact',methods=['GET', 'POST'])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        contact = Contact(Author = form.name.data,Content = form.content.data,created_at = datetime.now(),Email = form.email.data)
        contact.save()
        #flash('Things Done', 'info')
        mes = 'Things Done'
       # confirm_id = contact.id
        id = contact.id
        return redirect('/contact_sumbmit/{}/{}'.format(id,mes))
    return render_template('contact.html', form=form)

@bp.route('/contact_sumbmit/<string:cid>/<string:mes>',methods=['GET', 'POST'])
def contact_confirm(cid,mes):
    c = cn.objects.get_or_404(id = cid)
    return render_template('contact_confirm.html', contact = c,mes = mes)






@bp.route('/posts')
@bp.route('/posts/<string:post_title>')
def get_post(post_title):
    post = Post.objects.get_or_404(title__contains=post_title )
    return render_template("post.html", post=post)

@bp.route('/readme')
def readme():
    return render_template('readme.html')

@bp.route('/post')
@bp.route('/post/<int:page>')
def post_list(page=1):
    #image = 'images/coffee.jpg'
    i = Image.objects(cata = 'Post')[:3]
    post = Post.objects(status =True).paginate(page=page, per_page=4)
    return render_template("post_nav.html",  post=post,image = i)


@bp.route('/tag/<string:id>')
def view_tag_tags(id, page=1):

    #image = 'images/coffee.jpg'
    tags_post = Tag.objects(cata = 'Post')
    tags_reviews = Tag.objects(cata='Reviews')
    tags_news = Tag.objects(cata='News')
    post = Post.objects(status =True).filter(tags__in=[id])
    tag = Tag.objects(id = id).first()
    i = Image.objects(to_pub=True)[:3]
    #paginated_tags = post.paginate_field('tags', page=1, per_page=5)
    return render_template("tags.html",  paginated_tags=post,image = i,tags_post = tags_post,tags_news = tags_news,tags_reviews = tags_reviews,tag = tag)



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



	
