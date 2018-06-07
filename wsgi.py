#!/usr/bin/env python
# -*- coding: utf-8 -*-
# star :  gunicorn -w 3 wsgi:app -b 0.0.0.0:80
# stop : pkill gunicorn or  kill -9 `ps aux | grep gunicorn | awk '{print $2}'`

from werkzeug.contrib.fixers import ProxyFix
from sample_application import create_app

app = create_app()

app.wsgi_app = ProxyFix(app.wsgi_app)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
