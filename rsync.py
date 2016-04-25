import subprocess
import pymongo
# Este archivo debe correrse desde la raiz del proyecto: /superfotos
user = raw_input('Hacia que usuario? ')
machine = raw_input('Hacia que maquina? ')
server = raw_input('Que server es este? ')
serverDest = raw_input('Hacia que server? ')
rsync = "rsync -a " + server + "/uploads/ "  + user + "@" + machine + ":~/superfotos/" + serverDest + "/uploads"
print rsync
pro2 = subprocess.Popen(rsync.split(), stdout=subprocess.PIPE)
cm = "ls " + server + "/uploads" 
pro = subprocess.Popen(cm.split(), stdout=subprocess.PIPE)
output = pro.communicate()[0]
res = output.split()
print res
##############################################################
#### Ingresar lo que haya en uploads que no este en la bd ####
##############################################################

# Establishing connection to mongo

from pymongo import MongoClient
client = MongoClient('10.131.137.212', 27017)
db = client.superfotos

# getting server id

servers_collection = db.servers
s = servers_collection.find_one({"name":server})
s_id = s['_id']
print s_id

# analyzing files to update database.

posts_collection = db.posts
for img in res:
	posts = posts_collection.find()
	for p in posts:
		a = True
		if p['image']['filename'] == img:
			for i in p['image']['locations']:
				if i == s_id:
					a = False
			if a:
				lugares = p['image']['locations']
                        	lugares.append(s_id)
                        	#print lugares
				#print "Agregar ", s_id, " a ", p
				result = db.posts.update_one(
					{"_id" : p["_id"]},
					{
						"$set":{
							"image" : {
								"locations" : lugares,
								"name" : p["image"]["name"],
								"filename" : p["image"]["filename"],
								"uri" : p["image"]["uri"]
							}
						}
					}
				) 
				print result.modified_count
