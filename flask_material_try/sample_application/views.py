from flask import Blueprint, render_template, redirect, url_for


bp = Blueprint('test', __name__)



@bp.route('/')
def index():
    return render_template('new_test.html')
	
@bp.route('/image')
def image():
    return render_template('new_test.html')
    