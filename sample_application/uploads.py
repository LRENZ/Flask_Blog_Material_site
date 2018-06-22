import os
import time
import hashlib
from flask import Flask, render_template, redirect, url_for, request,Blueprint
from sample_application import photos
from .form import  UploadForm
from flask_login import login_required
from .model import picture


up = Blueprint('upload', __name__)


@up.route('/upload', methods=['GET', 'POST'])
@login_required
def upload_file():
    form = UploadForm()
    if form.validate_on_submit():
        for filename in request.files.getlist('photo'):
            #name = secure_filename(filename.filename)
            #photos.save(filename, name= name+'.')
            photos.save(filename)
            picture(file_name = filename.filename,file_url = photos.url(filename.filename)).save()
        success = True
    else:
        success = False
    return render_template('upload.html', form=form, success=success)


@up.route('/manage')
@login_required
def manage_file():
    pic = picture.objects.all()
    #files_list = os.listdir(os.getcwd() + '/uploads')
    #file_url = [photos.url(name) for name in files_list ]
    #image_url = zip(files_list,file_url)
    return render_template('manage.html', pic = pic)


@up.route('/open/<filename>')
@login_required
def open_file(filename):
    file_url = photos.url(filename)
    return render_template('browser.html', file_url=file_url)


@up.route('/delete/<filename>')
@login_required
def delete_file(filename):
    file_path = photos.path(filename)
    picture.objects(file_name=filename).delete()
    os.remove(file_path)
    return redirect(url_for('upload.manage_file'))

