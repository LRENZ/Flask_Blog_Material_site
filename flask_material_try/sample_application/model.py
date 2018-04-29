from flask_mongoengine import MongoEngine
from datetime import datetime

db = MongoEngine()


class User(db.Document):
    name = db.StringField(required=True, max_length=128)
    password = db.StringField(max_length=256)
    email = db.StringField(max_length=64)
    description = db.StringField(max_length=1024)

    # Flask-Login integration
    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    # TypeError: ObjectId('552f41e56a85f00dd043406b') is not JSON serializable
    def get_id(self):
        return str(self.id)

    def __unicode__(self):
        return self.name




class Todo(db.Document):
    title = db.StringField(max_length=60)
    text = db.StringField()
    done = db.BooleanField(default=False)
    pub_date = db.DateTimeField(default=datetime.now)
    user = db.ReferenceField(User, required=False)

    # Required for administrative interface
    def __unicode__(self):
        return self.title


class Tag(db.Document):
    name = db.StringField(max_length=10)

    def __unicode__(self):
        return self.name


class Comment(db.EmbeddedDocument):
    name = db.StringField(max_length=20, required=True)
    value = db.StringField(max_length=20)
    tag = db.ReferenceField(Tag)


post_status = ((0, 'draft'), (1, 'published'))


class Post(db.Document):
    title = db.StringField(required=True, max_length=64)
    content = db.StringField(required=True)
    #author = db.ReferenceField(User)
    tags = db.ListField(db.StringField(max_length=32))
    status = db.IntField(required=True, choices=post_status)
    create_time = db.DateTimeField(default=datetime.now)
    modify_time = db.DateTimeField(default=datetime.now)
    inner = db.ListField(db.EmbeddedDocumentField(Comment))
    name = db.StringField(max_length=20, required=True)
    lols = db.ListField(db.StringField(max_length=20))

    def __unicode__(self):
        return self.title

    meta = {
        'ordering': ['-create_time'],
    }




class File(db.Document):
    name = db.StringField(max_length=20)
    data = db.FileField()
    path =  db.StringField(max_length=20)


class Image(db.Document):
    name = db.StringField(max_length=20)
    image = db.ImageField(thumbnail_size=(100, 100, True))
    path =  db.StringField(max_length=20)
