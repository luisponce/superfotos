var express 	= 	require("express");
var multer  	=  require('multer');
var bodyParser = 	require('body-parser');
var session 	= 	require('express-session');
var DBController = require('./DBController');
var encrypter 	=  require('./helpers/passEncription');
var app 			= 	express();
var storage 	=  multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, './uploads');
	},
	filename: function (req, file, callback) {
		callback(null, req.body.name);
	}
});
var upload = multer({ storage : storage}).single('userPhoto');

app.set('views', __dirname + '/views');
app.use(express.static(__dirname+'/resources'));
app.engine('html', require('ejs').renderFile);

app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sess;

app.get('/',function(req,res){
	sess = req.session;
	if(sess.usr){
		res.redirect('/home');
	} else {
		res.render('login.html');
	}
});

app.get('/home', function(req, res){
	sess = req.session;
	if(sess.usr){
		res.render('index.html');
	} else {
		res.write('<h1>Please login first.</h1>');
		res.end('<a href="/">Login</a>');
	}
});


app.post('/register', function(req,res){
	sess = req.session;
	if(sess.usr){
		//TODO user already loged in
	} 

	var usr = new DBController.User({
		name: req.body.name,
		username: req.body.username,
		password: req.body.password
	});

	DBController.connect(function(req,res){
		usr.save(function(err, usr){
			if(err) {
				console.log(err);
				res.end(err);
			} else {
				sess.usr = usr.name;
			}
		});
	});
});

app.post('/login', function(req,res){
	sess=req.session;
	
	sess.usr = req.body.username;

    res.end('done');

	//encrypter.cryptPassword(req.body.pass, function(err,hash){
	// 	pass = hash;

		
	// 	res.end('done');
	// })
    ;
});

app.post('/api/photo',function(req,res){
	upload(req,res,function(err) {
		if(err) {
			return res.end(""+err);
		}

		res.write('<h1>File is uploaded</h1>');
		res.end('<a href="/uploads/'+req.body.name+'">view img</a>');
	});
});

app.get('/uploads/:name', function(req, res){
	var filename = req.params.name;
	res.sendFile(filename, {root: './uploads'});
});

app.get('/logout',function(req,res){
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});

app.listen(3005,function(){
	console.log("Working on port 3005");
});

