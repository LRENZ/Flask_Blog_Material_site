from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, DateTimeField,IntegerField,PasswordField
from wtforms.validators import DataRequired
from wtforms import form, fields, validators
from wtforms import form
from .model import User
#from app.models import User
from werkzeug.security import check_password_hash

class testForm(FlaskForm):
    name = StringField(u'what is their name', validators= [DataRequired()])
    content = StringField(u'what is your oppinion', validators=[DataRequired()])
    #time = DateTimeField(u'When ?', validators= None)
    watched  = IntegerField(u'0 stand for not watched yet ,1 for watched', validators=[DataRequired()])
    status = IntegerField(u'0 stand for not finishing  yet, 1 for finishing', validators=[DataRequired()])
    submit = SubmitField(u'Confirm')



# Define login and registration forms (for flask-login)
class LoginForm(form.Form):
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
  search = StringField('search', [DataRequired()])
  submit = SubmitField('Search',
                       render_kw={'class': 'btn waves-effect waves-light'})

