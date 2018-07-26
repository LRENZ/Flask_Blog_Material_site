from flask_ckeditor import CKEditorField
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from werkzeug.security import check_password_hash
from wtforms import StringField, SubmitField, DateTimeField, IntegerField, PasswordField, TextAreaField,SelectField
from wtforms import SubmitField
from wtforms import form, fields, validators
from wtforms.fields.html5 import EmailField
from wtforms.validators import DataRequired

from sample_application import photos
from .model import User


class testForm(FlaskForm):
    name = StringField(u'what is their name', validators=[DataRequired()])
    content = StringField(u'what is your oppinion', validators=[DataRequired()])
    # time = DateTimeField(u'When ?', validators= None)
    watched = IntegerField(u'0 stand for not watched yet ,1 for watched', validators=[DataRequired()])
    status = IntegerField(u'0 stand for not finishing  yet, 1 for finishing', validators=[DataRequired()])
    submit = SubmitField(u'Confirm')


# Define login and registration forms (for flask-login)
class LoginForm(FlaskForm):
    name = StringField('name', validators=[DataRequired()])
    password = PasswordField('password', validators=[DataRequired()])

    def get_user(self):
        user = User.objects(name=self.name.data).first()
        return user

    def validate_name(self, field):
        user = self.get_user()
        if user:
            if not check_password_hash(user.password, self.password.data):
                raise validators.ValidationError('password error')

        else:
            raise validators.ValidationError('user error')


"""

class RegistrationForm(form.Form):
    login = fields.StringField(validators=[validators.required()])
    email = fields.StringField()
    password = fields.PasswordField(validators=[validators.required()])

    def validate_login(self, field):
        if User.objects(login=self.login.data):
            raise validators.ValidationError('Duplicate username')

"""


class SearchForm(FlaskForm):
    choices = [('Artist', 'Artist'),
               ('Album', 'Album'),
               ('Publisher', 'Publisher')]
    select = SelectField('Search for music:', choices=choices)
    search = StringField('type keyword you want to search')
    submit = SubmitField(u'Confirm')


# photos = UploadSet('photos', IMAGES)
class ContactForm(FlaskForm):
    name = StringField(u'Tell Me Who You Are,  How Should I Call You', validators=[DataRequired()])
    content = CKEditorField(u'Any Problem, Bugs or Anything Else ?', validators=[DataRequired()],
                            render_kw={"placehold": "test"})
    # photo = FileField()
    # time = DateTimeField(u'When ?')
    email = EmailField(u'What is Your Email?  Help Me Get You Back', [validators.Email()])
    submit = SubmitField(u'Confirm')


class UploadForm(FlaskForm):
    photo = FileField(validators=[FileAllowed(photos, u'Image Only!'), FileRequired(u'Choose a file!')])
    submit = SubmitField(u'Upload')
