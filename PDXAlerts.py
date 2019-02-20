from app import app, db
from app.models import Tweet

@app.shell_context_processor
def make_shell_context():
	context = {
		'db': db,
		'Tweet': Tweet
	}
	return context

