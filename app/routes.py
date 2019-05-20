from flask import render_template, flash, redirect, url_for, request, json
from werkzeug.urls import url_parse
from app import app, db
from app.models import Tweet
from datetime import datetime, timedelta

@app.route('/')
@app.route('/index')
def index():
	tweets=[]

	# grab last 24 hours
	query_time = datetime.utcnow() - timedelta(seconds=(60*60*24))
	tweets = [t.dictify() for t in Tweet.query.filter(Tweet.created_at >= query_time).all()]

	with open('app/secret.json') as f:
		mapskey = json.loads(f.read())

	return render_template('index.html', tweets=tweets, mapskey=mapskey['googlemaps_apikey'])

@app.route('/api', methods=['POST', 'GET'])
def api():
	if request.method == 'POST':
		data = request.json

		if 'id' not in data:
			error_msg = {
				'message':'Invalid data submitted.'
			}
			return app.response_class(
				response=json.dumps(error_msg),
				status=400,
				mimetype='application/json'
			)

		# create and save new tweet
		tweet = Tweet()
		tweet.from_dict(data)	
		db.session.add(tweet)
		db.session.commit()

		msg = {
			'message':'success'
		}

		return app.response_class(
			response=json.dumps(msg),
			status=200,
			mimetype='application/json'
		)

	if request.method == 'GET':
		delta_parm = request.args.get('delta')
		if not delta_parm:
			error_msg = {
				'message':'A time delta parameter in seconds must be included.'
			}
			return app.response_class(
				response=json.dumps(error_msg),
				status=400,
				mimetype='application/json'
			)

		query_time = datetime.utcnow() - timedelta(seconds=int(delta_parm))

		tweets = Tweet.query.filter(Tweet.created_at >= query_time).all()
		dictified_tweets = [t.dictify() for t in tweets]

		return app.response_class(
			response=json.dumps(dictified_tweets),
			status=200,
			mimetype='application/json'
		)
