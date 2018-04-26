from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, DateTimeField,IntegerField
from wtforms.validators import DataRequired

class testForm(FlaskForm):
    name = StringField(u'what is their name', validators= [DataRequired()])
    content = StringField(u'what is your oppinion', validators=[DataRequired()])
    #time = DateTimeField(u'When ?', validators= None)
    watched  = IntegerField(u'0 stand for not watched yet ,1 for watched', validators=[DataRequired()])
    status = IntegerField(u'0 stand for not finishing  yet, 1 for finishing', validators=[DataRequired()])
    submit = SubmitField(u'Confirm')