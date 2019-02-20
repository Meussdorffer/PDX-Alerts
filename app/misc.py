def dataToCSV(Model):
	columns = Model.__table__.columns.keys()

	with open('tweets.csv', 'w') as f:
		# headers
		for col in columns:
			f.write(f'{col},')
		f.write('\n')

		# data
		for tweet in Model.query.all():
			for col in columns:
				t = tweet.dictify()
				if type(t[col]) == str:
					f.write(f'{t[col].replace(","," ")},')
				else:
					f.write(f'{t[col]},')
			f.write('\n')


