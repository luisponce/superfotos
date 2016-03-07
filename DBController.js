var mongoose = require('mongoose');
var connection = mongoose.createConnection('localhost', 'superfotos');
exports.connection = connection;

//user schema
var userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true,
		unique: true,
     	index: true
	},
	password: {
		type: String,
		required: true
	}
});

var UserModel = connection.model('User', userSchema);
exports.User = UserModel;

// User.statics.findByUsername = function(usrname, cb){
// 	return this.find({username: usrname}, cb);
// }
