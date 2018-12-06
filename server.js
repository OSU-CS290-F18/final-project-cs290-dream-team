var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var findHashtags = require('find-hashtags');


var mongoDB = null;

var user = {
	"first": "john",
	"last": "smith",
	"uid": "jsmith"
};
var userArray = [user.first, user.last, user.uid];

var app = express();
var port = process.env.PORT || 3000;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());

app.use(express.static('public'));


app.get('/', function (req,res,next) {
		res.render('blog', {'blog':{}, 'user': user});

		});

app.post('/create', function(req, res, next) {
		var db = mongoDb.collection('blog');
		if (!db) console.log("db in post create is null");
		var obj = req.body;
		var htags = findHashtags(obj.blog);
		obj.tags = userArray.concat(htags);
		console.log('obj to persist: ', obj);
		db.insertOne(obj);
		});


app.get('/commands/:commands', function (req,res,next) {
		console.log("In commands/commands");
		var db = mongoDb.collection('blog');
		if (!db) console.log("db in find is  null");
		var cmds = JSON.parse(req.params.commands);
		if ((cmds) && (cmds[0]) === ':f') {
		if (cmds.length === 1) {
		db.find({}).sort({'_id': -1}).toArray(function (err, contents) {
				if (contents.length === 0) { next(); } else {
				res.render('blogReader', {
						'layout': false,
						'contents': contents
						});
				}
				});
		} else if (cmds[1] === "-a"){
		console.log("IN -a all params must match");
		var cmdArray = cmds.slice(2, cmds.length);
		console.log("cmdArray: ", cmdArray);
		db.find({tags: {$all : cmdArray}}).sort({'_id': -1}).toArray(function (err, contents) {
				if (contents.length === 0) {next();} else {
				res.render('blogReader',{
						'layout': false,
						'contents': contents
						});
				}
				});
		} else {
			console.log("Any param must match");
			var cmdArray = cmds.slice(1, cmds.length);
			console.log("cmdArray: ", cmdArray);
			db.find({tags: {$in : cmdArray}}).sort({'_id': -1}).toArray(function (err, contents) {
					if (contents.length === 0) { next();} else {
					console.log("****After next()*****");
					res.render('blogReader', {
							'layout': false,
							'contents': contents
							});
					}
					});

		}

		} else if(cmds[0] === ':n') {

			res.render('blog', {
					'layout':false
					});
		};
});


app.get('*', function (req, res, next) {
		res.status(404).render('404', {layout: false});
		});



MongoClient.connect("mongodb://localhost:27017/test", function(err, client) {
		if(err) { return console.dir(err); }
		if(!err) console.log("we are connected***");

		mongoDb = client.db('test');
		app.listen(3000, function() {
				console.log("=== server on port", 3000);
				});

		});


