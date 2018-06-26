import os
import time
import hashlib
from flask import Flask, render_template, redirect, url_for, request,Blueprint,flash,jsonify
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
@up.route('/manage/<int:page>')
@login_required
def manage_file(page=1):
    pic = picture.objects.paginate(page=page, per_page=12)
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
    try:
        file_path = photos.path(filename)
        picture.objects(file_name=filename).delete()
        os.remove(file_path)
        flash("Pic Have Been Removed")
    except:
        flash("Something  Wrong When Deleted Picture")

    return redirect(url_for('upload.manage_file'))


@up.route('/update/tag/<id>', methods = ['POST'])
def update_tag():
    pic = picture.objects(id=id).first()
    if request.method == 'POST':
        data = request.json
        #access your data
        #for key, value in data.items():
            #key = id
            #value = id

        # run your query
        res = {
            'pic':pic.file_name,
        }
        #tags = ...
        return jsonify(res)

