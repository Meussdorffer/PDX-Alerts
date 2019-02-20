var feed = document.getElementById('tweet-feed');
var captured_tweets = []
var endpoint = 'http://localhost:5000/api';

function renderHTML(data) {
	var htmlString = '';

	for(var i=0; i < data.length; i++) {
		if(!captured_tweets.includes(data[i].id)) {
			htmlString += `<p> ${data[i].local_time} -- ${data[i].incident} at ${data[i].location}</p>`;
			captured_tweets.push(data[i].id);
		}
	}

	feed.insertAdjacentHTML('afterbegin', htmlString);
}

function poll() {
	$.get(
		endpoint,
		{
			delta: 60
		},
		function(data, status) {
			renderHTML(data);
		}
	)
}

function getLastFiveTweets() {
	$.get(
		endpoint,
		function(data, status) {
			
		}
	)
}

$(function() {
	setInterval(poll, 5000);
})

