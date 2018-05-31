from flask_material import Material
from . import  views
from flask import Flask, render_template, request, Markup, url_for, send_from_directory
from .views import bp
import flask_login as login
import os.path as op
import os
from .model import *
from flask_login import LoginManager
from .admin import create_admin
from flask_mongoengine import MongoEngineSessionInterface
from flask_disqus import Disqus
from flask_ckeditor import CKEditor
#from flask_wtf.csrf import CSRFProtect
from  .utils import  babel,my_format_datetime,format_meta_keywords,get_slug,get_rate,get_clean_tag,get_header_title,remove_slash
#from flask_thumbnails import Thumbnail
import os
from .reviews import rv
from .news import news
from mongoengine.queryset.visitor import Q
import config
#from flask_uploads import UploadSet, configure_uploads,patch_request_class
#from .form import photos



#def register_upload(app):

    #configure_uploads(app, photos)
    #patch_request_class(app)


def register_database(app):
    db.init_app(app)
    app.session_interface = MongoEngineSessionInterface(db)
 
def create_app():

    app = Flask(__name__)
    app.config.from_object(config.config['development'])
    register_babel(app)
    #register_upload(app)
    register_jinjia_filters(app)
    init_login(app)
    register_blueprints(app)
    register_database(app)
    create_admin(app)
    Material(app)
    disq = Disqus(app)
    ckeditor = CKEditor(app)
    #thumb = Thumbnail(app)
    #csrf.init_app(app)

    @app.route('/files/<filename>')
    def uploaded_files(filename):
        #path = app.config['ADMIN_UPLOADED_PATH']
        path = op.join(os.getcwd(), 'files')
        return send_from_directory(path, filename)
        #return str(path)


    return app


def register_blueprints(app):
    app.register_blueprint(bp)
    app.register_blueprint(rv)
    app.register_blueprint(news)

# Initialize flask-login
def init_login(app):
    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        from .model import User
        return User.objects(id=user_id).first()


def register_babel(app):
    babel.init_app(app)


def register_jinjia_filters(app):
    app.jinja_env.filters['my_format_datetime'] = my_format_datetime
    app.jinja_env.filters['format_meta_keywords'] = format_meta_keywords
    app.jinja_env.filters['get_slug'] = get_slug
    app.jinja_env.filters['get_rate'] = get_rate
    app.jinja_env.filters['get_clean_tag'] = get_clean_tag
    app.jinja_env.filters['get_header_title'] = get_header_title
    app.jinja_env.filters['remove_slash'] = remove_slash
    #app.jinja_env.filters['resize'] = resize
    app.add_template_global(get_js, 'get_js')





def get_js():
    search_code = Code.objects(Q(published=True) & Q(category='google_customs_search_js')).first() or "something wrong"
    return search_code.code



	



