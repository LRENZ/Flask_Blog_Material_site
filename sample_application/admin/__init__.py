import os
import os.path as op

from flask_admin import Admin
from flask_admin.contrib.fileadmin import FileAdmin
from werkzeug.security import generate_password_hash

from .admin import UserView, PostView, TodoView, ModelView, MyIndexView, FileView, ImageView, ReviewsView, TagView, \
    ContactView, CodeView,dataLayerView
from ..model import User, Post, Tag, Comment, Image, File, Review, Code, Info, Contact, picture,words,dataLayer

# path = op.join(op.dirname(__file__), 'files')
path = op.join(os.getcwd(), 'files')


def create_admin(app=None):
    admin = Admin(app, name="LRENZ", index_view=MyIndexView(), base_template='admin/my_master.html',
                  template_mode='bootstrap3')
    admin.add_view(UserView(User))
    admin.add_view(PostView(Post))
    admin.add_view(TodoView(Info))
    admin.add_view(TagView(Tag))
    admin.add_view(CodeView(Code))
    admin.add_view(dataLayerView(dataLayer,category='Tool'))
    admin.add_view(ContactView(Contact))
    admin.add_view(FileView(File, category='File'))
    admin.add_view(ImageView(Image, category='File'))
    admin.add_view(ReviewsView(Review))
    admin.add_view(ModelView(picture, category='File'))
    admin.add_view(ModelView(words, category='File'))
    admin.add_view(FileAdmin(path, '/files/', name='Static Files', category='File'))
