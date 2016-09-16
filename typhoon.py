import re
import sys
import math
import time
import requests
import pyrebase
from time import gmtime, strftime
from bs4 import BeautifulSoup

### lan, lng distance function
def distance(origin, destination):
    lat1, lon1 = origin
    lat2, lon2 = destination
    radius = 6371 # km

    dlat = math.radians(lat2-lat1)
    dlon = math.radians(lon2-lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    d = radius * c

    return round(d,3)

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

while True:
	### make url request
	res = requests.get(link)
	soup = BeautifulSoup(res.text.encode("latin1").decode(), "html.parser")
	typhoon_info = soup.select("#patch-0 font")
	typhoon_position = soup.select("#patch-0")

	### print out the data
	### for shop in typhoon_info:
		### print ("-------------\n")
		### print (shop.text)
	print (strftime("%Y-%m-%d %H:%M:%S"))
	print (typhoon_info[0].text)
	print (typhoon_info[1].text)
	title = "typhoon: "
	content = typhoon_info[0].text + ", " + typhoon_info[1].text
	position = re.findall("\d+\.\d+", typhoon_position[0].text)

	taiwan__middle__position = [23, 120]
	# position = ['20.4','122.9']
	two__point__distance = distance(taiwan__middle__position, [float(position[0]), float(position[1])])

	### claculate the distance between two point


	### write in txt file
	typhoon_JSON = open('typhoon_list.txt','w')
	typhoon_JSON.write(title + "\n")
	typhoon_JSON.write(content + "\n")
	typhoon_JSON.write(position[0] + "\n" + position[1] + "\n")
	typhoon_JSON.write(str(two__point__distance))


	### Get a reference to the database service
	db = firebase.database()
	typhoonData = {
		"type": typhoon_info[0].text,
		"name": typhoon_info[1].text,
		"lat": position[0],
		"lng": position[1],
		"distance": two__point__distance
	}
	# pwaData = {
	# 	"typhoon" : {
	# 		"distance" : 1810.8911,
	# 		"lat" : "31.6",
	# 		"lng" : "135.6",
	# 		"name" : "瑪瑙",
	# 		"type" : "輕度颱風"
	# 	},
	# 	"story" : [
	# 		{
	# 			"title"  : "Giant Rabbit",
	# 			"author" : "Ethelbert Lucy",
	# 			"price"  : 200
	# 		},

	# 		{
	# 			"title"  : "Turtle and Rabbit",
	# 			"author" : "George Brocas",
	# 			"price"  : 700
	# 		},

	# 		{
	# 			"title"  : "Peter Rabbit",
	# 			"author" : "Ellen Appleby",
	# 			"price"  : 500
	# 		},
	# 	]
	# }
	results = db.child('typhoon').update(typhoonData, user['idToken'])
	time.sleep(360)

### shut down the script
sys.stdout.flush()
typhoon_JSON.close()
sys.exit()
