from tweepy import Stream, OAuthHandler
from tweepy.streaming import StreamListener
from tweepy.api import API
import json
import re
import googlemaps
import requests
from datetime import datetime
import os

abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

with open('secret.json', 'r') as f:
    PARAMS = json.loads(f.read())

class Listener(StreamListener):

    def __init__(self, api=None):
        self.api = API(retry_count=10, retry_delay=30, timeout=1000, wait_on_rate_limit=True)
        self.gmaps = googlemaps.Client(key=PARAMS['googlemaps_apikey'])

    def parse_tweet(self, data):
        tweet_json = json.loads(data)

        split_incident_address = tweet_json['text'].split(' at ') 
        incident = split_incident_address[0]
        location = split_incident_address[1].split(' [Portland')[0]
        geocode = self.gmaps.geocode(location)[0]['geometry']['location']


        local_time_regex = re.compile(r'\d\d:\d\d')
        local_time = local_time_regex.findall(tweet_json['text'])

        if not local_time:
            local_time = 'null'
        else:
            local_time = local_time[0]

        tweet = {
            'created_at':       tweet_json['created_at'],
            'id':               tweet_json['id'],
            'text':             tweet_json['text'],
            'truncated':        tweet_json['truncated'],
            'user_id':          tweet_json['user']['id'],
            'user_name':        tweet_json['user']['name'],
            'user_screen_name': tweet_json['user']['screen_name'],
            'incident':         incident,
            'location':         location,
            'local_time':       local_time,
            'latitude':         float(geocode['lat']),
            'longitude':        float(geocode['lng'])
        }
        

        r = requests.post(
            PARAMS['endpoint'], 
            json=tweet,
            headers={'Content-Type':'application/json'},
            verify=True
        )

        print(f'{tweet["incident"]} | {tweet["local_time"]} | {r.status_code}')

    def on_data(self, data):
        try:
            self.parse_tweet(data)
        except Exception as e:
            print(f'{datetime.now()} -- {str(e)}')
            with open('streamlog.txt', 'w+') as f:
                f.write(f'{datetime.now()} -- {str(e)}')


    def on_error(self, status):
        print(status)


if __name__ == '__main__':

    track = ['1602852614',]

    auth = OAuthHandler(PARAMS['CONSUMER_KEY'], PARAMS['CONSUMER_SECRET'])
    auth.set_access_token(PARAMS['ACCESS_TOKEN'], PARAMS['ACCESS_TOKEN_SECRET'])

    twitterStream = Stream(auth, Listener())
    twitterStream.filter(languages=['en'], follow=track)



