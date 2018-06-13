from flask import Flask, request, render_template, session, flash, redirect, \
    url_for, jsonify,Blueprint
ap =  Blueprint('ap', __name__)
from flask_mail import  Message

#import  app.task as at
from .task import long_task,send_async_email

@ap.route('/celery', methods=['GET', 'POST'])
def celery_index():
    if request.method == 'GET':
        return render_template('celery.html', email=session.get('email', ''))
    email = request.form['email']
    session['email'] = email

    # send the email
    msg = Message('Hello from Flask',
                  recipients=[request.form['email']])
    msg.body = 'This is a test email sent from a background Celery task.'
    if request.form['submit'] == 'Send':
        # send right away
        send_async_email.delay(msg)
        flash('Sending email to {0}'.format(email))
    else:
        # send in one minute
        send_async_email.apply_async(args=[msg], countdown=60)
        flash('An email will be sent to {0} in one minute'.format(email))

    return redirect(url_for('.celery_index'))


@ap.route('/longtask', methods=['POST'])
def longtask():
    #from app.task import long_task
    task = long_task.apply_async()
    return jsonify({}), 202, {'Location': url_for('.taskstatus',
                                                  task_id=task.id)}


@ap.route('/status/<task_id>')
def taskstatus(task_id):
    #from app.task import long_task
    task = long_task.AsyncResult(task_id)
    if task.state == 'PENDING':
        response = {
            'state': task.state,
            'current': 0,
            'total': 1,
            'status': 'Pending...'
        }
    elif task.state != 'FAILURE':
        response = {
            'state': task.state,
            'current': task.info.get('current', 0),
            'total': task.info.get('total', 1),
            'status': task.info.get('status', '')
        }
        if 'result' in task.info:
            response['result'] = task.info['result']
    else:
        # something went wrong in the background job
        response = {
            'state': task.state,
            'current': 1,
            'total': 1,
            'status': str(task.info),  # this is the exception raised
        }
    return jsonify(response)