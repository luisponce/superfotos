var mongoose = require('mongoose');
exports.mongoose;
exports.connect = function(){
    mongoose.connect('mongodb://localhost/superfotos');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function(){
	console.log('db connected');
    });
}

//user schema
var userSchema = mongoose.Schema({
	name: String,
	username: String,
	password: String
});


var User = mongoose.model('User', userSchema);
exports.User = User;

// User.statics.findByUsername = function(usrname, cb){
// 	return this.find({username: usrname}, cb);
// }
