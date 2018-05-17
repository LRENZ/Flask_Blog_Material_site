from flask_material import Material
from . import  views
from flask import Flask
from .views import bp
import flask_login as login
from .model import *
from flask_login import LoginManager
from .admin import create_admin
from flask_mongoengine import MongoEngineSessionInterface
from micawber import bootstrap_basic, parse_html
from micawber.cache import Cache as OEmbedCache
from micawber.contrib.mcflask import add_oembed_filters
from flask_disqus import Disqus
from flask_ckeditor import CKEditor
#from flask_wtf.csrf import CSRFProtect
from  .utils import  babel,my_format_datetime,format_meta_keywords,get_slug
from flask_thumbnails import Thumbnail


oembed_providers = bootstrap_basic(OEmbedCache())
#csrf = CSRFProtect()



def register_database(app):
    db.init_app(app)
    app.session_interface = MongoEngineSessionInterface(db)
 
def create_app():

    app = Flask(__name__)
    app.debug = True
    #app.config.from_object('config')
    app.config['SECRET_KEY'] = 'devkeytestibsvbdsvbsd'
    #app.config['DEBUG_TB_PANELS'] = ['flask_mongoengine.panels.MongoDebugPanel']
    #app.config['MONGODB_SETTINGS'] = {'db': 'testing'}
    #toolbar = DebugToolbarExtension(app)
    #toolbar.init_app(app)
	#app.config['DISQUS_SECRET_KEY']
	#app.config['DISQUS_PUBLIC_KEY']
    #app.config['CKEDITOR_HEIGHT'] = 400
    #app.config['CKEDITOR_FILE_UPLOADER'] = 'upload'
    #app.config['UPLOADED_PATH'] = basedir + '/uploads'
    add_oembed_filters(app, oembed_providers)

    app.config['CKEDITOR_PKG_TYPE'] = 'full'
    app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
    app.config['THUMBNAIL_MEDIA_ROOT'] = '/home/www/media'
    app.config['THUMBNAIL_MEDIA_URL'] = '/media/'


    app.config['MONGODB_SETTINGS'] = {
        'db': 'testing',
        'connect': False,
    }
    register_babel(app)
    register_jinjia_filters(app)
    init_login(app)
    register_blueprints(app)
    register_database(app)
    create_admin(app)
    Material(app)
    disq = Disqus(app)
    ckeditor = CKEditor(app)
    thumb = Thumbnail(app)
    #csrf.init_app(app)


    return app


def register_blueprints(app):
    app.register_blueprint(bp)

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
