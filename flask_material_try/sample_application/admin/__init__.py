from flask_admin import Admin
from .admin import UserView,PostView,TodoView,ModelView,MyIndexView,FileView,ImageView
#from app.models import User, Post
from ..model import User,Post,Tag,Todo,Comment,Image,File
from werkzeug.security import generate_password_hash


def create_admin(app=None):
    admin = Admin(app, name="LRENZ", index_view=MyIndexView(), base_template='admin/my_master.html')
    admin.add_view(UserView(User))
    admin.add_view(PostView(Post))
    admin.add_view(TodoView(Todo))
    admin.add_view(ModelView(Tag))
    admin.add_view(FileView(File))
    admin.add_view(ImageView(Image))

def create_test_admin(name = 'lrenz', password = 'liurenzhongqq!0'):
    admin = User(name=name, password=generate_password_hash(password))
    admin.save()
