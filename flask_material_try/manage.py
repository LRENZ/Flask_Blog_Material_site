import os

if os.path.exists('.env'):
    print('Importing environment from .env...')
    for line in open('.env'):
        var = line.strip().split('=')
        if len(var) == 2:
            os.environ[var[0]] = var[1]

from flask_script import Manager, Server
from sample_application import create_app
from sample_application.model import Post,User
from werkzeug.security import generate_password_hash
from pprint import  pprint
from werkzeug.contrib.fixers import ProxyFix

app = create_app()
manager = Manager(app)
app.wsgi_app = ProxyFix(app.wsgi_app)

manager.add_command("runserver",
                    Server(host='0.0.0.0',
                           port=5000,
                           use_debugger=True))


@manager.option('-u', '--name', dest='name', default='admin')
@manager.option('-p', '--password', dest='password', default='123456')
def create_admin(name, password):
    admin = User(name=name, password=generate_password_hash(password))
    admin.save()


@manager.command
def add_post():
    user = User.objects(name="admin").first()
    content = """
    <p>This is a test</p>
<p>http://www.youtube.com/watch?v=nda_OSWeyn8</p>
<p>This will get rendered as a link: http://www.youtube.com/watch?v=nda_OSWeyn8</p>
<p>This will not be modified: <a href="http://www.google.com/">http://www.youtube.com/watch?v=nda_OSWeyn8</a></p>
    """
    post = Post(title="testing", content=content,
                name=user,
                tags=['python', 'flask'],
                status=1)
    post.save()

@manager.option('-s', '--search', dest='search', default='test')
def search(search):
    objects = Post.objects.search_text(search).order_by('$text_score')
    pprint(objects)



if __name__ == '__main__':
    manager.run()
