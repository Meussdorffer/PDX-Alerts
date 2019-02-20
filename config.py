import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
	SECRET_KEY = os.environ.get('SECRET_KEY') or 'do you ever feel like a plastic bag'
	SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
	 	'sqlite:///' + os.path.join(basedir, 'alerts.db')
	SQLALCHEMY_TRACK_MODIFICATIONS = False



