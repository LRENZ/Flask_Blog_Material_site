import os
import random
import time
from flask import Flask, request, render_template, session, flash, redirect, \
    url_for, jsonify
#from  import celery,mail
from sample_application import celery,mail
#import celery
from flask import current_app,Flask
from flask_mail import Mail, Message





@celery.task
def send_async_email(msg):
    """Background task to send an email with Flask-Mail."""

    with current_app.app_context():
         mail.send(msg)

@celery.task(bind=True)
def long_task(self):
    """Background task that runs a long function with progress reports."""
    verb = ['Starting up', 'Booting', 'Repairing', 'Loading', 'Checking']
    adjective = ['master', 'radiant', 'silent', 'harmonic', 'fast']
    noun = ['solar array', 'particle reshaper', 'cosmic ray', 'orbiter', 'bit']
    message = ''
    total = random.randint(10, 50)
    for i in range(total):
        if not message or random.random() < 0.25:
            message = '{0} {1} {2}...'.format(random.choice(verb),
                                              random.choice(adjective),
                                              random.choice(noun))
        self.update_state(state='PROGRESS',
                          meta={'current': i, 'total': total,
                                'status': message})
        time.sleep(1)
    return {'current': 100, 'total': 100, 'status': 'Task completed!',
            'result': 42}