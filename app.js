//author: Lucas Blanchard 
//email: blanchlu@oregonstate.edu

var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var mysql = require('./dbcon.js'); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/static', express.static('public')); 

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 6045);
app.set('mysql', mysql);
app.use('/places', require('./places.js')); 
app.use('/activities', require('./activities.js')); 
app.use('/guides', require('./guides.js')); 

app.get('/', function(req, res){
    var context = {}; 
    context.activities = [{guide:"Alex Honold",locale: "Yosemite, California", title: "Rock Climbing", description:"Bring your shoes and chalk", price: "20.00"},
    {guide:"Gabo", locale: "Bogotá, Colombia",title: "Language Workshop",description: "Learn the language from a master",  price: "35.00"}, 
    {guide:"Carlos Gardel", locale: "Buenos Aires, Argentina", title: "Tango Lessons", description:"We have lessons for all levels", price: "20.00"}]; 
    context.header = "Start Exploring"; 
    res.render('home', context); 
}); 


app.get('/guide-details', function(req, res){
    var context = {}; 
    context.header = "Guides"; 
    res.render('guideDetails', context); 
}); 

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
