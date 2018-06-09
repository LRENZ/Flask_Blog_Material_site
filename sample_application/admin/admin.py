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
from ..utils import get_slug
from jinja2 import Markup





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
        else:
            redirect(url_for('blog.index'))


        self._template_args['form'] = form

        return super(MyIndexView, self).index()

    @expose('/logout/')
    def logout_view(self):
        logout_user()
        return redirect(url_for('.index'))




"""
# Define wtforms widget and field
class CKTextAreaWidget(widgets.TextArea):
    def __call__(self, field, **kwargs):
        kwargs.setdefault('class_', 'ckeditor')
        return super(CKTextAreaWidget, self).__call__(field, **kwargs)



class CKTextAreaField(fields.TextAreaField):
    widget = CKTextAreaWidget()
"""



class UserView(ModelView):
    can_create = False
    can_delete = True
    column_display_pk = True
    column_filters = ('name', 'email')

    edit_template = 'admin/edit_user.html'
    form_overrides = dict(description=CKEditorField)

    form_columns = ('name', 'email', 'description')

    def is_accessible(self):
        return current_user.is_authenticated

class CodeView(ModelView):
    can_create = True
    can_delete = True
    column_filters = ('published', 'category')

    def is_accessible(self):
        return current_user.is_authenticated

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return redirect(url_for('admin.login', next=request.url))




class PostView(ModelView):
    def get_content(view, context, model, name):
        if not model.content:
            return ''

        return str(model.content)[:200]

    column_formatters = {
        'content': get_content,
        'html' :get_content,

    }

    column_display_pk = True
    #edit_modal = True
    #create_modal = True
    can_export = True
    export_types = ['xls','csv']

    form_overrides = dict(content=CKEditorField)
    create_template = 'admin/create_post.html'
    edit_template = 'admin/edit_post.html'
    #column_formatters = dict(content = lambda v, c, m, p: m)

    column_list = ( 'title', 'content',  'tags', 'status', 'create_time', 'modify_time','image')
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

    column_filters = ('title','content','create_time')

    column_searchable_list = ('content','title',)

    column_sortable_list = ('create_time', 'modify_time')

    form_ajax_refs = {
        'tags': {
            'fields': ('name',)
        }
    }

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

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return redirect(url_for('admin.login', next=request.url))


class TodoView(ModelView):
    def get_content(view, context, model, name):
        if not model.text:
            return ''

        return str(model.text)[:200]



    column_filters = ['done']
    can_export = True
    export_types = ['xls','csv']
    create_template = 'admin/create_post.html'
    edit_template = 'admin/edit_post.html'
    column_filters = ('title', 'text', 'pub_date')
    column_sortable_list = ('pub_date', )
    column_formatters = {
        'text': get_content,
        'html': get_content
    }
    form_overrides = {
        'text':CKEditorField,
    }
    #column_labels = dict(last_name='News')
    def is_accessible(self):
        return current_user.is_authenticated


class TagView(ModelView):
    column_filters = ['cata']
    column_filters = ('cata', 'name')
    column_sortable_list = ('cata', )
    column_choices = {
        'cata': [('Post','Post'), ('Reviews','Reviews'), ('Todo','Todo')]
    }

    def is_accessible(self):
        return current_user.is_authenticated

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return redirect(url_for('admin.login', next=request.url))


# Administrative views
class FileView(ModelView):
    # Override form field to use Flask-Admin FileUploadField
    form_overrides = {
        'path': form.FileUploadField
    }
    column_filters = ('name',)

    # Pass additional parameters to 'path' to FileUploadField constructor
    form_args = {
        'path': {
            'label': 'File',
            'base_path': file_path,
            'allow_overwrite': False
        }
    }
    def is_accessible(self):
        return current_user.is_authenticated

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return redirect(url_for('admin.login', next=request.url))



class ImageView(ModelView):
    def _list_thumbnail(view, context, model, name):
        if not model.path:
            return ''

        return Markup('<img src="%s">' % url_for('static',
                                                 filename=form.thumbgen_filename(model.path)))

    #column_formatters = {
        #'path': _list_thumbnail
    #}
    #form_columns = ('name', 'Image', 'Url')
    column_searchable_list = ( 'name',)
    column_exclude_list = ('path', 'Path')
    edit_modal = True
    create_modal = True
    # Alternative way to contribute field is to override it completely.
    # In this case, Flask-Admin won't attempt to merge various parameters for the field.
    form_extra_fields = {
        'path': form.ImageUploadField('path',
                                      base_path='static/images',
                                      thumbnail_size=(100, 100, True))
    }

    column_choices = {
        'cata': [('Post','Post'), ('Reviews','Reviews'), ('Todo','Todo')]
    }

    """
        form_extra_fields = {
        'path': form.ImageUploadField('Image',
                                      base_path=file_path,
                                      thumbnail_size=(100, 100, True))
    }

    """
    def is_accessible(self):
        return current_user.is_authenticated

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return redirect(url_for('admin.login', next=request.url))





class ReviewsView(ModelView):
    def get_content(view, context, model, name):
        if not model.content:
            return ''

        return str(model.content)[:200]

    column_formatters = {
        'content': get_content,
        'html': get_content
    }

    column_display_pk = True
    #edit_modal = True
    #create_modal = True
    can_export = True
    export_types = ['xls','csv']

    form_overrides = dict(content=CKEditorField)
    create_template = 'admin/create_post.html'
    edit_template = 'admin/edit_post.html'
    #column_formatters = dict(content = lambda v, c, m, p: m)

    column_list = ( 'title', 'content',  'tags','rate' ,'status', 'create_time', 'modify_time','image')
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

    column_filters = ('title','content','create_time')

    column_searchable_list = ('content','title',)

    column_sortable_list = ('create_time', 'modify_time')

    form_ajax_refs = {
        'tags': {
            'fields': ('name',)
        }
    }

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

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return redirect(url_for('admin.login', next=request.url))

class ContactView(ModelView):
        def get_content(view, context, model, name):
            if not model.Content:
                return ''

            return str(model.Content )[:200]

        column_formatters = {
            'Content': get_content
        }
        can_create = False
        can_delete = True
        column_display_pk = True
        column_filters = ('Author','Content', 'Email')

        edit_template = 'admin/edit_user.html'
        form_overrides = dict(Content=CKEditorField)
        column_list = ('created_at','Author','Content', 'Email','Whether_to_reply')

        def is_accessible(self):
            return current_user.is_authenticated

        def inaccessible_callback(self, name, **kwargs):
            # redirect to login page if user doesn't have access
            return redirect(url_for('admin.login', next=request.url))

