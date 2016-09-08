import re
import sys
import time
import requests
import pyrebase
from bs4 import BeautifulSoup


# Firebase config
config = {
  "apiKey": "AIzaSyAOVPc16JfzEutPA95U9h3TT1rQnQR1DLA",
  "authDomain": "quote-b781f.firebaseapp.com",
  "databaseURL": "https://quote-b781f.firebaseio.com/",
  "storageBucket": "quote-b781f.appspot.com"
}
firebase = pyrebase.initialize_app(config)


# Get a reference to the auth service
email = "ajaxtest@gmail.com"
password = "ajaxtest"
auth = firebase.auth()
user = auth.sign_in_with_email_and_password(email, password)


### link content 
link = 'http://www.cwb.gov.tw/V7/prevent/typhoon/Data/PTA_NEW/index.htm'


### make url request
res = requests.get(link)
soup = BeautifulSoup(res.text.encode("latin1").decode(), "html.parser")
typhoon_info = soup.select(".patch font")
typhoon_position = soup.select(".patch")


### print out the data
### for shop in typhoon_info:
	### print ("-------------\n")
	### print (shop.text)
### print (typhoon_info[0].text)
### print (typhoon_info[1].text)
title = "typhoon: "
content = typhoon_info[0].text + ", " + typhoon_info[1].text
position = re.findall("\d+\.\d+", typhoon_position[0].text)


### write in txt file
typhoon_JSON = open('typhoon_list.txt','w')
typhoon_JSON.write(title + "\n")
typhoon_JSON.write(content + "\n")
typhoon_JSON.write(position[0] + "\n" + position[1] + "\n")



### Get a reference to the database service
db = firebase.database()
typhoonData = {
	"type": typhoon_info[0].text,
	"name": typhoon_info[1].text,
	"lat": position[0],
	"lng": position[1],
}
results = db.child("typhoon").update(typhoonData, user['idToken'])


### shut down the script
sys.stdout.flush()
typhoon_JSON.close()
sys.exit()
