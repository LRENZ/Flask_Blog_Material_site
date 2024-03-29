from datetime import datetime
import mongoengine
from flask_mongoengine import MongoEngine
from flask_mongoengine.wtf import model_form
from mongoengine import queryset_manager

db = MongoEngine()
c = [('Post', 'Post'), ('Reviews', 'Reviews'), ('News', 'News')]


class Image(db.Document):
    name = db.StringField()
    image = db.ImageField(thumbnail_size=(100, 100, True))
    path = db.StringField()
    to_pub = db.BooleanField(default=False)
    #url = db.StringField()
    time = db.DateTimeField(default=datetime.now)
    des = db.StringField()
    meta = {
        'ordering': ['-time'],
        'strict': False,
    }


class words(db.Document):
    word = db.StringField()
    exp = db.StringField()
    dic = db.DictField()
    des = db.StringField()
    title =  db.StringField()
    url = db.StringField()
    time = db.DateTimeField(default=datetime.now)
    meta = {
        'ordering': ['-time'],
        'strict': False,
    }


class User(db.Document):
    name = db.StringField(required=True, max_length=128)
    password = db.StringField(max_length=256)
    email = db.StringField(max_length=64)
    description = db.StringField(max_length=1024)
    tags = db.StringField(max_length=256)

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


class Code(db.Document):
    code = db.StringField()
    des = db.StringField()
    published = db.BooleanField(default=False)
    pub_date = db.DateTimeField(default=datetime.now)
    category = db.StringField(default='google_customs_search_js')


class dataLayer(db.Document):
    url = db.StringField()
    datalayer = db.StringField(default = "dataLayer = [];")
    published = db.BooleanField(default=True)
    pub_date = db.DateTimeField(default=datetime.now)
    des = db.StringField()


class Info(db.Document):
    title = db.StringField(max_length=128)
    text = db.StringField()
    user = db.StringField(default='LRENZ')
    done = db.BooleanField(default=False)
    pub_date = db.DateTimeField(default=datetime.now)
    tags = db.ListField(db.ReferenceField('Tag'), reverse_delete_rule=mongoengine.PULL)
    image = db.StringField()
    html = db.StringField()

    # Required for administrative interface
    def __unicode__(self):
        return self.title

    meta = {
        'ordering': ['-pub_date'],
        'strict': False,
        'indexes': [
            {'fields': ['$title', "$text"],
             'weights': {'title': 10, 'text': 2}
             }]
    }


class Tag(db.Document):
    name = db.StringField(max_length=50)
    cata = db.StringField(choices=c)
    des = db.StringField()

    def __unicode__(self):
        return self.name


class Comment(db.EmbeddedDocument):
    created_at = db.DateTimeField(default=datetime.now, required=True)
    body = db.StringField(verbose_name="Comment", required=True)
    author = db.StringField(verbose_name="Name", max_length=255, required=True)
    meta = {
        'ordering': ['-create_time'],
        'strict': False,
    }


post_status = ((0, 'draft'), (1, 'published'))

class File(db.Document):
    name = db.StringField()
    search_name = db.StringField()
    cata = db.StringField(choices=c)
    data = db.FileField()
    post_title = db.ListField(db.ReferenceField('Post'), reverse_delete_rule=mongoengine.PULL)
    path = db.StringField(max_length=20)
    #image = db.ImageField(thumbnail_size=(100, 100, True))
    time = db.DateTimeField(default=datetime.now)

    def clean(self):
        try:
            if self.name:
                self.search_name = str(self.post_title[0].title) +'__'+self.name
            else:
                self.name = str(self.post_title[0].title)
        except:
            pass


    meta = {
        'ordering': ['-time'],
        'strict': False,
    }


class Post(db.Document):
    title = db.StringField(required=True, max_length=128)
    content = db.StringField()
    # comments = db.ListField(db.EmbeddedDocumentField('Comment'))
    # images = db.ListField(db.EmbeddedDocumentField('Image'))
    tags = db.ListField(db.ReferenceField('Tag'), reverse_delete_rule=mongoengine.PULL)
    # status = db.IntField(required=True, choices=post_status)
    status = db.BooleanField(default=True)
    create_time = db.DateTimeField(default=datetime.now)
    modify_time = db.DateTimeField(default=datetime.now)
    inner = db.ListField(db.EmbeddedDocumentField(Comment))
    #files = db.ListField(db.EmbeddedDocumentField('File'))
    name = db.StringField(max_length=64, default='LRENZ')
    # lols = db.ListField(db.StringField(max_length=20))
    image = db.StringField()
    html = db.StringField()

    def __unicode__(self):
        return self.title

    meta = {
        'ordering': ['-modify_time'],
        'strict': False,
        'indexes': [
            {'fields': ['$title', "$content"],
             'weights': {'title': 10, 'content': 2}
             }]
    }





class Review(db.Document):
    title = db.StringField(required=True, max_length=128)
    rate = db.StringField(render_kw={"placeholder": "Rate From 1 to 10"})
    content = db.StringField()
    # comments = db.ListField(db.EmbeddedDocumentField('Comment'))
    # images = db.ListField(db.EmbeddedDocumentField('Image'))
    tags = db.ListField(db.ReferenceField('Tag'), reverse_delete_rule=mongoengine.PULL)
    # status = db.IntField(required=True, choices=post_status)
    status = db.BooleanField(default=True)
    create_time = db.DateTimeField(default=datetime.now)
    modify_time = db.DateTimeField(default=datetime.now)
    inner = db.ListField(db.EmbeddedDocumentField(Comment))
    name = db.StringField(max_length=64, default='LRENZ')
    # lols = db.ListField(db.StringField(max_length=20))
    image = db.StringField()
    html = db.StringField()

    def __unicode__(self):
        return self.title

    meta = {
        'ordering': ['-modify_time'],
        'strict': False,
        'indexes': [
            {'fields': ['$title', "$content"],
             'weights': {'title': 10, 'content': 2}
             }]
    }


class Contact(db.Document):
    created_at = db.DateTimeField(default=datetime.now)
    Author = db.StringField()
    Content = db.StringField()
    Email = db.EmailField()
    Whether_to_reply = db.BooleanField(default=False)
    # image =  db.StringField()
    meta = {
        'ordering': ['-create_at'],
        'strict': False,
    }


class picture(db.Document):
    file_name = db.StringField()
    file_url = db.StringField()
    des = db.StringField(max_length=128)
    time = db.DateTimeField(default=datetime.now)
    tag = db.ListField(db.StringField(max_length=20), reverse_delete_rule=mongoengine.PULL)
    meta = {
        'ordering': ['-time'],
        'strict': False,
    }
