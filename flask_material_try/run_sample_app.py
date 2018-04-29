# under normal circumstances, this script would not be necessary. the
# sample_application would have its own setup.py and be properly installed;
# however since it is not bundled in the sdist package, we need some hacks
# to make it work

from sample_application import create_app
from sample_application.admin import create_test_admin

from flask_debugtoolbar import DebugToolbarExtension
app = create_app()
app.debug = True
toolbar = DebugToolbarExtension()
toolbar.init_app(app)

if __name__ == "__main__":
    #create_test_admin()
    app.run(port=5000)

