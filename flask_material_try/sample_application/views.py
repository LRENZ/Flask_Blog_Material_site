from flask import Blueprint, render_template, redirect, url_for
from .form import  testForm
bp = Blueprint('blog', __name__)



@bp.route('/')
def index():
    return render_template('index.html')
	
@bp.route('/post')
def image():
    return render_template('new_test.html')


@bp.route('/detail')
def post():
    return render_template('post.html')


@bp.route('/readme')
def readme():
    return render_template('readme.html')

@bp.route('/form')
def testform():
    form = testForm()
    return render_template('test.html',form=form)
    