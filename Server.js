var express = require("express");
var multer = require('multer');
var bodyParser = require('body-parser');
var session = require('express-session');
var DBController = require('./DBController');
var encrypter = require('./helpers/passEncription');
var fs = require('fs');
var app = express();
var mkdirp = require('mkdirp');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, dir);
    },
    filename: function (req, file, callback) {
        callback(null, req.session.usr + "-" + Date.now());
    }
});
var upload = multer({storage: storage}).single('userPhoto');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/resources'));
app.engine('html', require('ejs').renderFile);

app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sess;

app.get('/', function (req, res) {
    sess = req.session;
    if (sess.usr) {
        res.redirect('/home');
    } else {
        res.render('login.html');
    }
});

app.get('/signup', function (req, res) {
    sess = req.session;
    if (sess.usr) {
        res.redirect('/home');
    } else {
        res.render('signup.html');
    }
});

app.get('/publish', function (req, res) {
    sess = req.session;
    if (sess.usr) {
        res.render('index.html');
    } else {
        res.redirect('/');
    }
});

app.post('/register', function (req, res) {
    sess = req.session;
    if (sess.usr) {
        //TODO user already logged in
    } //else {
    //res.redirect('/signup');
    //}

    encrypter.cryptPassword(req.body.password, function (err, hash) {
        if (err) {
            //TODO error handling
        }
        var user = {
            name: req.body.name,
            username: req.body.username,
            password: hash
        };

        var userInstance = new DBController.User(user);
        userInstance.save(function (err, userInstance) {
            if (err) {
                console.log(err);
                res.end(err);
            } else {
                res.redirect('/');
                res.end('done');
            }
        });
    });
});

app.post('/login', function (req, res) {
    sess = req.session;
    if (sess.usr) {
        //TODO user already logged in
    }

    DBController.User
        .findOne({'username': req.body.username}, function (err, user) {
            if (err)
                res.end(err);
            if (user === null) {
                res.end('wrong username');
            } else {
                encrypter
                    .comparePassword(req.body.password, user.password, function (err, isMatch) {
                        if (err)
                            res.end(err);
                        if (isMatch) {
                            sess.usr = user.username;
                            res.redirect('/');
                            res.end('done');
                        } else {
                            res.end('wrong password')
                        }
                    });
            }
        });
});

//function setUploadEngine(){
//    storage = multer.diskStorage({
//        destination: function (req, file, callback) {
//            callback(null, dir);
//        },
//        filename: function (req, file, callback) {
//            callback(null, req.session.usr + "-" + Date.now());
//        }
//    });
//    upload = multer({storage: storage}).single('userPhoto');
//}

app.post('/post', upload,  function (req, res, next) {
    var body = req.body;

    sess = req.session;
    if (sess.usr === null) {
        res.end('Access Denied');
    } else {
        DBController.User
            .findOne({'username': sess.usr}, function (err, user) {
                if (err) {
                    //TODO error handling
                    console.log(err);
                } else
//                    setUploadEngine();
                    upload(req, res, function (err) {
                        if (err) {
                            return res.end(err);
                        } else {
                            // req.file is the file
                            // req.body will hold the text fields, if there were any
                            var tagarr = new Array();

                            // tagarr = body.taglist.split(',');

                            var urlFriendlyPostName = body.postname.split(' ')
                                .join('%20');

                            var post = {
                                owner: user._id,
                                title: body.postname,
                                image: {
                                    name: body.imagename,
                                    filename: req.file.filename,
                                    uri: "/post/" + urlFriendlyPostName + "/photo"
                                },
                                description: body.description
                            };

                            var postInstance = new DBController.Post(post);

                            postInstance.image.locations.push(server);

                            postInstance.save(function (err, postInstance) {
                                if (err) {
                                    //TODO error handling
                                } else {
                                    // crearTags(tagarr, postInstance, function(postInstance){
                                    // 	res.end('created');
                                    // });
                                    user.posts.push(postInstance);
                                    user.save();

                                    res.redirect('/myposts');
                                }
                            });
                        }
                    });
            });
    }
});

function crearTags(tagarr, postInstance, cb) {
    for (var i = tagarr.length - 1; i >= 0; i--) {
        var tagInstance = new DBController.Tag({name: tagarr[i]});
        tagInstance.save(function (err, tag) {
            if (err) {
                //TODO error handling
            }
            postInstance.tags.push(tagInstance);
            postInstance.save();
        });
    }
    ;

    return cb(postInstance);
}

app.get('/myposts', function (req, res) {
    sess = req.session;
    if (sess.usr === null) {
        res.redirect('/');
    } else {
        DBController.User
            .findOne({'username': sess.usr})
            .populate('posts')
            .exec(function (err, user) {
                if (err) {
                    console.log(err);
                } else {
                    if (user.posts) {
                        res.render('listMyPosts', {
                            misposts: user.posts
                        });
                    } else {
                        res.end();
                    }
                }

            });
    }
});

app.get('/home', function(req,res){
	sess = req.session;
	if (sess.usr === null) {
		res.redirect('/');
	} else {
		DBController.Post.find().limit(20).exec(function(err, posts){
			res.render('postList', {
             misposts: posts
         });
		});
	}
});

app.get('/post/:title', function (req, res) {
    var title = req.params.title;

    //TODO: validate user logged in is owner of post
    DBController.Post
        .findOne({'title': title}, function (err, post) {
            if (err) {
                res.end(err);
            } else {
                res.end(JSON.stringify(post));
            }
        });
});

app.get('/post/:title/photo', function (req, res) {
    var title = req.params.title;

    DBController.Post.findOne({'title': title})
    .exec(function (err, post) {
        if (err) {
            res.end(err);
        } else {
            var filename = post.image.filename;
	    for (var s in post.image.locations){
		DBController.Server.findOne({_id:post.image.locations[s]}, function(err, serv){
			if(serv.available){
				try{
					console.log(serv._id);
					var img = fs.readFileSync(serv.folder + filename);
					res.writeHead(200, {'Content-type': 'image/png'});
					res.end(img, 'binary');
				}catch(err){
					console.log(err.message)
				}
			}
		});
	    }
	/*
            DBController.Server.findOne({_id:post.image.locations[0]}, function(err, serv){
                var img = fs.readFileSync(serv.folder + filename);
                res.writeHead(200, {'Content-Type': 'image/png'});
                res.end(img, 'binary');
            });
	*/
            // res.sendFile(filename, {root: './uploads'});
        }
    });
});

app.get('/uploads/:name', function (req, res) {
    var filename = req.params.name;
    res.sendFile(filename, {root: dir});
});

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

var serverName;
var dir;
var server;

app.listen(3005, function () {
    var argv = require('minimist')(process.argv.slice(2));
    if (argv.s){
        serverName = argv.s;
    } else {
        serverName = 'default';
    }
    
    DBController.Server.findOne({name: serverName}, function(err, serv){
        if(err) console.error(err);
        else {
            if(!serv){
                //create server in DB
                server = {
                    name: serverName,
                    folder: './'+serverName+'/uploads/'
                };
                DBController.Server(server).save(function(err, newServ){
                    if(err) console.error(err);
                    else {
                        server  = newServ;
                        serverRegistered();
                    }
                });
            } else {
                server = serv;
                serverRegistered();
            }
        }
    });
});

function serverRegistered(){
    dir = server.folder;
    mkdirp(dir, function (err) {
        if (err) console.error(err);
        else console.log('working on directory '+dir);
    });
    
    console.log("Server '"+serverName+"' working on port 3005");
}
