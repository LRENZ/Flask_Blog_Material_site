import os
import os
import os.path as op

from celery import Celery
from flask import Flask, render_template, request, Markup, url_for, send_from_directory, redirect
from flask_ckeditor import CKEditor
from flask_mail import Mail
from flask_material import Material
from flask_mongoengine import MongoEngineSessionInterface

from .model import *
from .utils import babel, my_format_datetime, format_meta_keywords, get_slug, get_rate, get_clean_tag, get_header_title, \
    remove_slash

celery = Celery(__name__, broker='redis://localhost:6379/0')
mail = Mail()

from mongoengine.queryset.visitor import Q
import config
from flask_uploads import UploadSet, configure_uploads, IMAGES, patch_request_class

# def register_upload(app):

# configure_uploads(app, photos)
# patch_request_class(app)
photos = UploadSet('photos', IMAGES)


def register_database(app):
    db.init_app(app)
    app.session_interface = MongoEngineSessionInterface(db)


def create_app():
    app = Flask(__name__)
    app.config.from_object(config.config['testing'])
    register_babel(app)
    # register_upload(app)
    register_jinjia_filters(app)
    init_login(app)
    register_blueprints(app)
    register_database(app)
    register_admin(app)
    Material(app)
    # disq = Disqus(app)
    ckeditor = CKEditor(app)
    # thumb = Thumbnail(app)
    # csrf.init_app(app)
    # Flask-Mail configuration
    app.config['MAIL_SERVER'] = 'smtp.qq.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', )
    app.config['MAIL_DEFAULT_SENDER'] = '778450014@qq.com'
    # Celery configuration
    app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
    app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'
    mail.init_app(app)
    # Initialize extensions
    celery.conf.update(app.config)

    @app.route('/files/<filename>')
    def uploaded_files(filename):
        # path = app.config['ADMIN_UPLOADED_PATH']
        path = op.join(os.getcwd(), 'files')
        return send_from_directory(path, filename)

    @app.route('/_uploads/photos/<filename>')
    def uploads(filename):
        # path = app.config['ADMIN_UPLOADED_PATH']
        path = os.getcwd() + '/uploads'
        if op.join(path, filename):
            return send_from_directory(path, filename)
        else:
            return "Nope"
            # return str(path)

    app.config['UPLOADED_PHOTOS_DEST'] = os.getcwd() + '/uploads'
    configure_uploads(app, photos)
    patch_request_class(app)  # set maximum file size, default is 16MB

    return app


def register_admin(app):
    from .admin import create_admin
    create_admin(app)


def register_blueprints(app):
    from .reviews import rv
    from .news import news
    from .views import bp
    from .celery_work import ap
    from .uploads import up
    app.register_blueprint(bp)
    app.register_blueprint(rv)
    app.register_blueprint(news)
    app.register_blueprint(ap)
    app.register_blueprint(up)


# Initialize flask-login
def init_login(app):
    from flask_login import LoginManager
    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.unauthorized_handler
    def unauthorized():
        #next = request.args.get('next')
        # do stuff
        return redirect(url_for('admin.login'))

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
    # app.jinja_env.filters['resize'] = resize
    app.add_template_global(get_js, 'get_js')


def get_js():
    search_code = Code.objects(Q(published=True) & Q(category='google_customs_search_js')).first() or "something wrong"
    return search_code.code
