#!/usr/bin/env python3
import os
import json
import sys
import requests
from requests_oauthlib import OAuth1

text = os.environ.get('X_POST_TEXT')
if not text:
    print('X_POST_TEXT missing', file=sys.stderr)
    sys.exit(1)

consumer_key = os.environ['X_CONSUMER_KEY']
consumer_secret = os.environ['X_CONSUMER_SECRET']
access_token = os.environ['X_ACCESS_TOKEN']
access_token_secret = os.environ['X_ACCESS_TOKEN_SECRET']

auth = OAuth1(consumer_key, consumer_secret, access_token, access_token_secret)
resp = requests.post(
    'https://api.twitter.com/2/tweets',
    auth=auth,
    json={'text': text},
    timeout=30,
)
print(resp.status_code)
print(resp.text)
resp.raise_for_status()
