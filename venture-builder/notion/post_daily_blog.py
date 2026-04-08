#!/usr/bin/env python3
import os
import sys
import requests
from datetime import datetime

NOTION_TOKEN = os.environ.get('NOTION_TOKEN')
PARENT_PAGE_ID = os.environ.get('NOTION_PARENT_PAGE_ID')
TITLE = os.environ.get('BLOG_TITLE')
BODY = os.environ.get('BLOG_BODY')

if not NOTION_TOKEN or not PARENT_PAGE_ID or not TITLE or not BODY:
    print('Missing NOTION_TOKEN, NOTION_PARENT_PAGE_ID, BLOG_TITLE, or BLOG_BODY', file=sys.stderr)
    sys.exit(1)

headers = {
    'Authorization': f'Bearer {NOTION_TOKEN}',
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
}

def paragraph_block(text):
    return {
        'object': 'block',
        'type': 'paragraph',
        'paragraph': {
            'rich_text': [
                {
                    'type': 'text',
                    'text': {'content': text}
                }
            ]
        }
    }

body_lines = [line.strip() for line in BODY.split('\n') if line.strip()]
children = [paragraph_block(line) for line in body_lines]

payload = {
    'parent': {'page_id': PARENT_PAGE_ID},
    'properties': {
        'title': {
            'title': [
                {
                    'type': 'text',
                    'text': {'content': TITLE}
                }
            ]
        }
    },
    'children': children,
}

resp = requests.post('https://api.notion.com/v1/pages', headers=headers, json=payload, timeout=30)
print(resp.status_code)
print(resp.text)
resp.raise_for_status()
