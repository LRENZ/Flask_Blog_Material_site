# under normal circumstances, this script would not be necessary. the
# sample_application would have its own setup.py and be properly installed;
# however since it is not bundled in the sdist package, we need some hacks
# to make it work

from sample_application import create_app

app = create_app()

if __name__ == "__main__":
    app.run(port=5000, debug=True)

