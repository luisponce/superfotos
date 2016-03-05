var mongoose = require('mongoose');

exports.connect = function(callback){
    mongoose.connect('mongodb://localhost/superfotos');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', callback);
}

//user schema
var userSchema = new mongoose.Schema({
	name: String,
	username: String,
	password: String

});

exports.User = User;
var User = mongoose.model('User', userSchema);

// User.statics.findByUsername = function(usrname, cb){
// 	return this.find({username: usrname}, cb);
// }
