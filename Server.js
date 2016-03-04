var express =   require("express");
var multer  =   require('multer');
var app         =   express();
var storage =   multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, './uploads');
	},
	filename: function (req, file, callback) {
		callback(null, req.body.name);
	}
});
var upload = multer({ storage : storage}).single('userPhoto');

app.use(express.static(__dirname+'/'));

app.get('/',function(req,res){
	res.sendFile(__dirname + "/index.html");
});

app.post('/api/photo',function(req,res){
	upload(req,res,function(err) {
		if(err) {
			return res.end(""+err);
		}
		res.end("File is uploaded");
	});
});

app.get('/uploads/:name', function(req, res){
	var filename = req.params.name;
	res.sendFile(filename, {root: './uploads'});
});

app.listen(3005,function(){
	console.log("Working on port 3005");
});