
import logging
import os
import time

from flask import Flask, render_template, redirect, url_for, request, Blueprint, flash, jsonify
from flask_login import login_required


from sample_application import photos
from .form import UploadForm,SearchForm
from .model import picture
from .task import detect_text_uri, detect_web_uri

logging.basicConfig(level=logging.DEBUG)

up = Blueprint('upload', __name__)





@up.route('/upload', methods=['GET', 'POST'])
@login_required
def upload_file():
    form = UploadForm()
    searchform = SearchForm()
    if form.validate_on_submit():
        for filename in request.files.getlist('photo'):
            # name = secure_filename(filename.filename)
            # photos.save(filename, name= name+'.')
            photos.save(filename)
            picture(file_name=filename.filename, file_url=photos.url(filename.filename)).save()
        # url = 'https://linpiner.com/_uploads/photos/6l0dknr8e8nlze1npbkv43tp9.jpg'
        # detect_web_uri.delay(url)
        success = True
    else:
        success = False
    return render_template('upload.html', form=form, success=success,searchform = searchform)


@up.route('/manage')
@up.route('/manage/<int:page>')
@login_required
def manage_file(page=1):
    pic = picture.objects.paginate(page=page, per_page=12)
    # files_list = os.listdir(os.getcwd() + '/uploads')
    # file_url = [photos.url(name) for name in files_list ]
    # image_url = zip(files_list,file_url)
    return render_template('manage.html', pic=pic)


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


@up.route('/update/tag/<id>', methods=['POST', 'GET'])
def update_tag(id):
    pic = picture.objects(id=id).first()
    if request.method == 'POST':
        data = request.get_json()
        tag = [x['tag'] for x in data]
        tag_res = [{'tag': x['tag']} for x in data]
        if pic.tag:
            pic.tag = tag
            pic.save()
            mes = 'You Have Changed  Tags'
            # access your data
            # for key, value in data.items():
            # key = id
            # value = id
        else:
            pic.tag = tag
            pic.save()
            mes = 'You Have Added New Tags'


            # run your query
        res = {
            'pic': pic.file_name,
            'tag': tag_res,
            'mes': mes
        }
        # tags = ...
        return jsonify(res)
    else:
        return jsonify(
            {
                'pic': pic.file_name,
                'tag': tag_res,
                'mes': "Post Error"
            }
        )


@up.route('/get/tag/<id>', methods=['POST', 'GET'])
def get_tag(id):
    try:
        pic = picture.objects(id=id).first()
        tag = pic.tag
        tag = [{'tag': x} for x in tag]
        return jsonify({'data': tag})
    except:
        return jsonify({'data': 'error'})


@up.route('/search',methods=['POST', 'GET'])
def get_search():
    searchform = SearchForm()

