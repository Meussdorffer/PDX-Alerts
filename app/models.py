from datetime import datetime
from app import db
import json

class Tweet(db.Model):
	id = db.Column(db.String(240), primary_key=True)
	created_at = db.Column(db.DateTime, index=True, default=datetime.utcnow)
	text = db.Column(db.String(240))
	truncated = db.Column(db.Boolean)
	user_id = db.Column(db.String(120))
	user_name = db.Column(db.String(120))
	user_screen_name = db.Column(db.String(120))
	incident = db.Column(db.String(120))
	location = db.Column(db.String(120))
	local_time = db.Column(db.String(10))
	latitude = db.Column(db.Float())
	longitude = db.Column(db.Float())

	def __repr__(self):
		return f'<Tweet {self.id}>'

	def from_dict(self, data):
		fields = self.__table__.columns.keys()

		for field in fields:
			if field in data and field != 'created_at':
				setattr(self, field, data[field])

		if 'created_at' in data:
			dt = datetime.strptime(data['created_at'], r'%a %b %d %H:%M:%S +0000 %Y')
			setattr(self, 'created_at', dt)

	def dictify(self):
		dictified_tweet = {
			col: getattr(self, col) for col in self.__table__.columns.keys()
		}
		dictified_tweet['created_at'] = datetime.strftime(
			dictified_tweet['created_at'],
			r'%Y-%m-%dT%H:%M:%SZ'
		)
		return dictified_tweet


