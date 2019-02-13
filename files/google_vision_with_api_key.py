# coding: utf-8

import base64
import json
from pprint import pprint

import requests



from mongoengine import *
import datetime
connect('testing')

class Google_Vision(Document):
    name = StringField(unique = True)
    res = DictField()
    date_modified = DateTimeField(default=datetime.datetime.utcnow)



googleapikeys = 'AIzaSyCpbqA1v5T5sk4xwuSL_yLUqJAvORGT5bY'

GOOGLE_CLOUD_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate?key='


def goog_cloud_vison(image_content):
    api_url = GOOGLE_CLOUD_VISION_API_URL + googleapikeys
    req_body = json.dumps({
        'requests': [{
            'image': {
                'content': image_content
            },
            'features': [{
                'type': 'WEB_DETECTION',
                'maxResults': 10,
            }]
        }]
    })

    res = requests.post(api_url, data=req_body)
    return res.json()


def goog_cloud_vison_url(image_content):
    api_url = GOOGLE_CLOUD_VISION_API_URL + googleapikeys
    req_body = json.dumps({
        "requests": [
            {
                "image": {
                    "source": {
                        "imageUri": image_content
                    }
                },
                "features": [
                    {
                        "type": "WEB_DETECTION",
                        "maxResults": 5
                    }
                ]
            }
        ]
    })

    res = requests.post(api_url, data=req_body)
    return res.json()


test_image_url = "https://linpiner.com/_uploads/photos/b5f2ebde0eefa38fccd87f13631f1747.jpg"
#p = Google_Vision(name  = test_image_url)

result = goog_cloud_vison_url(test_image_url)
#pprint(result)
#p.res = result
#p.save()
r= Google_Vision.objects.first()
pprint(r.res)

bestguesslabels = r.res['responses'][0]['webDetection']['bestGuessLabels']
pprint(bestguesslabels)
fullMatchingImages = r.res['responses'][0]['webDetection']['fullMatchingImages']
pprint(fullMatchingImages)

"""
print('************************************bestGuessLabels***************************************************\n')
pprint(result['responses'][0]['webDetection']['bestGuessLabels'])
bestguesslabels = result['responses'][0]['webDetection']['bestGuessLabels']
print('***********************************fullMatchingImages****************************************************\n')

pprint(result['responses'][0]['webDetection']['fullMatchingImages'])
fullMatchingImages = result['responses'][0]['webDetection']['fullMatchingImages']

print('*************************************pagesWithMatchingImages**************************************************\n')
pprint(result['responses'][0]['webDetection']['pagesWithMatchingImages'])


print('*************************************partialMatchingImages**************************************************\n')
pprint(result['responses'][0]['webDetection']['partialMatchingImages'])

print('************************************visuallySimilarImages***************************************************\n')
pprint(result['responses'][0]['webDetection']['visuallySimilarImages'])

print('******************************webEntities*********************************************************\n')
pprint(result['responses'][0]['webDetection']['webEntities'])
"""
