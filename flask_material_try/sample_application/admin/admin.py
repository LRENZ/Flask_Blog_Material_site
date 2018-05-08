from flask_admin.contrib.mongoengine import ModelView
from wtforms import fields, widgets
from flask_admin import AdminIndexView, expose, helpers,form
from flask_login import current_user, login_user, logout_user
from flask import redirect, url_for, request
from flask_admin.form import rules
#from .forms import LoginForm
from ..form import LoginForm
import  os
import os.path as op
from flask_ckeditor import CKEditorField


# Create directory for file fields to use
file_path = op.join(op.dirname(__file__), 'files')
try:
    os.mkdir(file_path)
except OSError:
    pass

class MyIndexView(AdminIndexView):
    @expose('/')
    def index(self):
        if not current_user.is_authenticated:
            return redirect(url_for('.login'))
        return super(MyIndexView, self).index()

    @expose('/login', methods=('GET', 'POST'))
    def login(self):
        form = LoginForm(request.form)
        if request.method == 'POST' and form.validate():
            user = form.get_user()
            login_user(user)
            redirect(url_for('.index'))

        self._template_args['form'] = form

        return super(MyIndexView, self).index()

    @expose('/logout/')
    def logout_view(self):
        logout_user()
        return redirect(url_for('.index'))


# Define wtforms widget and field
class CKTextAreaWidget(widgets.TextArea):
    def __call__(self, field, **kwargs):
        kwargs.setdefault('class_', 'ckeditor')
        return super(CKTextAreaWidget, self).__call__(field, **kwargs)



class CKTextAreaField(fields.TextAreaField):
    widget = CKTextAreaWidget()


class UserView(ModelView):
    can_create = False
    can_delete = False
    column_display_pk = True
    column_filters = ('name', 'email')

    edit_template = 'admin/edit_user.html'
    form_overrides = dict(description=CKEditorField)

    form_columns = ('name', 'email', 'description')

    def is_accessible(self):
        return current_user.is_authenticated


class PostView(ModelView):

    column_display_pk = True

    form_overrides = dict(content=CKEditorField)
    create_template = 'admin/create_post.html'
    edit_template = 'admin/edit_post.html'

    column_list = ('id', 'title', 'content', 'author', 'tags', 'status', 'create_time', 'modify_time','inner')
    # column_labels = dict(id='ID',
    #                      title=u'标题',
    #                      content=u'内容',
    #                      author=u'作者',
    #                      tags=u'标签',
    #                      status=u'状态',
    #                      create_time=u'创建时间',
    #                      modify_time=u'修改时间')

    column_choices = {
        'status': [
            (0, 'draft'),
            (1, 'published')
        ]
    }

    column_filters = ('title',)

    column_searchable_list = ('content',)

    column_sortable_list = ('create_time', 'modify_time')

    form_subdocuments = {
        'inner': {
            'form_subdocuments': {
                None: {
                    # Add <hr> at the end of the form
                    'form_rules': ('created_at', 'body', 'author', rules.HTML('<hr>')),
                    'form_widget_args': {
                        'name': {
                            'style': 'color: red'
                        }
                    }
                }
            }
        }
    }

    def is_accessible(self):
        return current_user.is_authenticated


class TodoView(ModelView):
    column_filters = ['done']


# Administrative views
class FileView(ModelView):
    # Override form field to use Flask-Admin FileUploadField
    form_overrides = {
        'path': form.FileUploadField
    }

    # Pass additional parameters to 'path' to FileUploadField constructor
    form_args = {
        'path': {
            'label': 'File',
            'base_path': file_path,
            'allow_overwrite': False
        }
    }


class ImageView(ModelView):
    def _list_thumbnail(view, context, model, name):
        if not model.path:
            return ''

        return Markup('<img src="%s">' % url_for('static',
                                                 filename=form.thumbgen_filename(model.path)))

    column_formatters = {
        'path': _list_thumbnail
    }

    # Alternative way to contribute field is to override it completely.
    # In this case, Flask-Admin won't attempt to merge various parameters for the field.
    form_extra_fields = {
        'path': form.ImageUploadField('Image',
                                      base_path=file_path,
                                      thumbnail_size=(100, 100, True))
    }
