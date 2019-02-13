from flask import Flask,render_template
from flask import Blueprint,redirect,url_for


lx = Blueprint('lx', __name__,
               template_folder='GTM_templates',
               static_folder='GTM_static',
               static_url_path='',
               url_prefix='/gtm')

@lx.route('/index.html')
def gtm_index():
    return render_template('gtm_index.html')

@lx.route('/eec')
@lx.route('/eec_index.html')
def gtm_eec_index():
    return render_template('eec_index.html')

@lx.route('/item/item/<string:item>')
def gtm_item_eec_index(item):
    return redirect('./item/{}'.format(item))
    #return 'hello world'

@lx.route('/eec_checkout.html')
@lx.route('/checkout')
def gtm_eec_checkout():
    return render_template('eec_checkout.html')

@lx.route('/destinations.html')
def destination():
    return render_template('destinations.html')

@lx.route('/checkout.html')
def checkout():
    return render_template('checkout.html')

@lx.route('/thankyou.html')
def thankyou():
    return render_template('thankyou.html')

