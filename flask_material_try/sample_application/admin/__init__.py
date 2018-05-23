from flask_admin import Admin
from .admin import UserView,PostView,TodoView,ModelView,MyIndexView,FileView,ImageView,ReviewsView
#from app.models import User, Post
from ..model import User,Post,Tag,Todo,Comment,Image,File,Review
from werkzeug.security import generate_password_hash
from flask_admin.contrib.fileadmin import FileAdmin
import os.path as op
path = op.join(op.dirname(__file__), 'files')


def create_admin(app=None):
    admin = Admin(app, name="LRENZ", index_view=MyIndexView(), base_template='admin/my_master.html',template_mode='bootstrap3')
    admin.add_view(UserView(User))
    admin.add_view(PostView(Post))
    admin.add_view(TodoView(Todo))
    admin.add_view(ModelView(Tag))
    admin.add_view(FileView(File))
    admin.add_view(ImageView(Image))
    admin.add_view(ReviewsView(Review))
    admin.add_view(FileAdmin(path, '/files/', name='Static Files'))

