import os
import json

basedir = os.path.abspath(os.path.dirname(__file__))

with open('app/secret.json') as f:
	secret = json.loads(f.read())

class Config(object):
	SECRET_KEY = os.environ.get('SECRET_KEY') or secret['FLASK_SECRET']
	SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
	 	'sqlite:///' + os.path.join(basedir, 'alerts.db')
	SQLALCHEMY_TRACK_MODIFICATIONS = False



