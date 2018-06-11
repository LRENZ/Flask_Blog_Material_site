#!/usr/bin/env python
# -*- coding: utf-8 -*-
# star :  gunicorn -w 3 wsgi:app -b 0.0.0.0:80
# stop : pkill gunicorn or  kill -9 `ps aux | grep gunicorn | awk '{print $2}'`
#  cd /home/www/flask_project/Flask_Blog_Material_site
# ln -s /usr/local/python3/bin/virtualenv /usr/bin/virtualenv
#virtualenv --no-site-packages --python=/usr/local/python3 venv3
# virtualenv --python=python3 --no-site-packages venv
#source venv/bin/activate
#gunicorn -w 4 wsgi:app -b 0.0.0.0:80
#pip install -r requirement
# set SECRET_KEY
# export SECRET_KEY

from werkzeug.contrib.fixers import ProxyFix
from sample_application import create_app

app = create_app()

app.wsgi_app = ProxyFix(app.wsgi_app)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
