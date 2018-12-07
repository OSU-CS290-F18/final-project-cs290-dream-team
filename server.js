var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var findHashtags = require('find-hashtags'); //added module to parse and extract #'s from the blog

var mongoDB = null;

//#assume this is the user that's logged on. 
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

//this route is displayed when the user first starts the app and for the route ":m"
app.get('/', function (req,res,next) {
		res.render('blog', {'blog':{}, 'user': user});

		});

//this route inserts one blog 
app.post('/create', function(req, res, next) {
		var db = mongoDb.collection('blog');
		if (!db) console.log("db in post create is null");
		var obj = req.body;
		var htags = findHashtags(obj.blog);
		obj.tags = userArray.concat(htags);
		console.log('obj to persist: ', obj);
		db.insertOne(obj);
		});

//this route returns blogs for command ":f"

app.get('/commands/:commands', function (req,res,next) {
		console.log("In commands/commands");
		var db = mongoDb.collection('blog');
		if (!db) console.log("db in find is  null");
		var cmds = JSON.parse(req.params.commands);
		if ((cmds) && (cmds[0]) === ':f') {
		if (cmds.length === 1) {
		//find all
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
		//match all tags entered with ":f" AND operator
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
			//match any tag after ":f" OR operator
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
			//render page to add a new blog
			res.render('blog', {
					'layout':false
					});
		};
});


app.get('*', function (req, res, next) {
		//nothing matched the search or the user entered invalid URL
		res.status(404).render('404', {layout: false});
		});


//connect to mongo and if successfull, start node on specified port
MongoClient.connect("mongodb://localhost:27017/test", function(err, client) {
		if(err) { return console.dir(err); }
		if(!err) console.log("we are connected***");

		mongoDb = client.db('test');
		app.listen(3000, function() {
				console.log("=== server on port", 3000);
				});

		});


