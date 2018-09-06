import os

basedir = os.path.abspath(os.path.dirname(__file__))
key = '\xeew\xe4\xc0\xee\xb1]\x9b\xa0\x9e)\x15Qhem\xe5\xf17\xd6\xceB\xb7\xb4'


class BaseConfig:
    SECRET_KEY = os.getenv('SECRET_KEY', key)
    CKEDITOR_PKG_TYPE = 'full'
    DEBUG_TB_INTERCEPT_REDIRECTS = False
    UPLOADED_PHOTOS_DEST = os.getcwd()
    CKEDITOR_SERVE_LOCAL = True
    CKEDITOR_EXTRA_PLUGINS = 'filebrowser'
    CKEDITOR_FILE_UPLOADER = True
    CKEDITOR_FILE_BROWSER = True
    CKEDITOR_ENABLE_MARKDOWN = True
    CKEDITOR_ENABLE_CODESNIPPET = True
    CKEDITOR_ENABLE_MARKDOWN = True
    CKEDITOR_FILE_UPLOADER = 'upload'
    TEMPLATES_AUTO_RELOAD = True
    # UPLOADED_PATH = os.path.join(basedir, 'uploads')


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    MONGODB_SETTINGS = {
        'db': 'testing',
        'connect': False,
    }


class TestingConfig(BaseConfig):
    DEBUG = False
    MONGODB_SETTINGS = {
        'db': 'testing',
        'connect': False,
    }


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}



