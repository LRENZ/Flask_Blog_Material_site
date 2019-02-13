from flask import Flask,render_template,request
from flask import Blueprint,redirect,url_for


fm = Blueprint('fm', __name__,
               template_folder='Form_template',
               static_folder='Form_static',
               static_url_path='',
               url_prefix='/form')

@fm.route('/index',methods=['GET', 'POST'])
def form_index():
    data = request.form.get('name')
    if data:
        return redirect(url_for('.form_submit'))
    data = None
    return render_template('form_index.html')
    #return 'hello world'

@fm.route('/submit',methods=['GET', 'POST'])
def form_submit():
    return render_template('form_submit.html')



