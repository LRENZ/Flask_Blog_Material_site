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

oembed_providers = bootstrap_basic(OEmbedCache())



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
    add_oembed_filters(app, oembed_providers)

    app.config['CKEDITOR_PKG_TYPE'] = 'full'


    app.config['MONGODB_SETTINGS'] = {
        'db': 'testing',
        'connect': False,
    }
    #register_babel(app)
    #register_jinjia_filters(app)
    init_login(app)
    register_blueprints(app)
    register_database(app)
    create_admin(app)
    Material(app)
    disq = Disqus(app)
    ckeditor = CKEditor(app)


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
