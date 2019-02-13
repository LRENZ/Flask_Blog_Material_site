from flask import Flask,render_template
from flask import Blueprint,redirect,url_for


eec = Blueprint('eec', __name__,
               template_folder='GTM_templates',
               static_folder='GTM_static',
               static_url_path='',
               )


@eec.route('/eec')
@eec.route('/eec_index.html')
def gtm_eec_index():
    return render_template('eec_index.html')

@eec.route('/item/item/<string:item>')
def gtm_item_eec_index(item):
    return redirect('./item/{}'.format(item))
    #return 'hello world'

@eec.route('/eec_checkout.html')
@eec.route('/checkout')
def gtm_eec_checkout():
    return render_template('eec_checkout.html')


