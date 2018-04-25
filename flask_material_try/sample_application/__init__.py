from flask_material import Material
from flask_appconfig import AppConfig
from . import form
from . import  views
from flask import Flask
from .views import bp
 
def create_app():

    app = Flask(__name__)

    #app.config.from_object('config')
    app.config['SECRET_KEY'] = 'devkeytestibsvbdsvbsd'
    #register_babel(app)
    #register_jinjia_filters(app)
    #init_login(app)
    register_blueprints(app)
    #register_database(app)
    #create_admin(app)
    Material(app)

    return app


def register_blueprints(app):
    app.register_blueprint(bp)

