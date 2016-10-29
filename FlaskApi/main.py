from flask import Flask
import flask
import os
import sys
import base64

from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper
from mnist_javacafe_study import *

def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, str):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, str):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator

app = Flask(__name__)

@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())

@app.route("/hello", methods=['GET', 'POST'])
def hello():
    return "Hello World!"

@app.route("/upload", methods=['GET', 'POST'])
@crossdomain(origin='*')
def upload():
    with open("../TensorFlow-mnist/blog/canvas.png", "wb") as fh:
        fh.write(base64.b64decode(request.form.get("imgBase64").replace("data:image/png;base64,","")))
    print('New image created.')

    # os.system("sh ../mnist/resize-script.sh")
    # return "Hello World!"
    # print os.system("python ./mnist_javacafe_study.py")
    result = ocr()
    print result
    return flask.jsonify(**result)

    # return "11"

@app.route("/test", methods=['GET', 'POST'])
def test():
	return "" + os.system("./test.py")

app.debug = True
if __name__ == "__main__":
    app.run()
