export.mongoose = require('mongoose');

export.connect = function(req,res, callback){
    mongoose.connect('mongodb://10.131.137.121/superfotos');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', callback(req,res));
}

