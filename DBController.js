var mongoose = require('mongoose'), Schema = mongoose.Schema;
var connection = mongoose.createConnection('localhost', 'superfotos');
exports.connection = connection;

//user schema
var userSchema = new Schema({
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
	},
	posts: [{type: Schema.Types.ObjectId, ref: 'Posts'}], 
	subscriptions: [{type: Schema.Types.ObjectId, ref: 'Tag'}]
});
var UserModel = connection.model('User', userSchema);
exports.User = UserModel;

//Post schema
var postSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId, 
		required: true,
		ref: 'User'
	},
	title: {
		type: String,
		required: true
	},
	image: {
		name: {
			type: String,
			required: true
		},
		filename: {
			type: String,
			required: true
		},
		uri: {
			type: String,
			required: true
		}
	},
	description: String,
	tags: [{type: Schema.Types.ObjectId, ref: 'Tag'}]
});
var PostModel = connection.model('Post', postSchema);
exports.Post = PostModel;

//tag schema
var tagSchema = new Schema({
	name: {
		type: String,
		required: true
	}
});
var TagModel = connection.model('Tag', tagSchema);
exports.Tag = TagModel;



