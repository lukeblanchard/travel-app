module.exports = function(){
    var express = require('express'); 
    var router = express.Router(); 

    function getPlaces(res, mysql, context, complete){
        mysql.pool.query("SELECT id, city, country FROM ta_places", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            context.places = results; 
            complete(); 
        }); 
    }

    function getGuides(res, mysql, context, complete){
        mysql.pool.query("SELECT id, fname, lname FROM ta_guides", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            context.guides = results; 
            complete(); 
        }); 
    }

    function getGuideLocation(mysql, guide_id, context, complete){ 
        var sql = "SELECT services_location FROM ta_guides WHERE id = ?";
        var inserts = [guide_id]; 
        mysql.pool.query(sql, inserts, function(error, results, fields){
            context.loc = results[0].services_location;  
            complete(); 
        }); 
    }

    function getActivities(res, mysql, context, complete){
        mysql.pool.query("SELECT A.id, P.city, P.country, A.title, A.price_per_person, A.duration, A.description, A.category FROM ta_activities A INNER JOIN ta_places P ON location = P.id", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            context.activities = results; 
            complete(); 
        }); 
    }

    function getActivity(res, mysql, context, id, complete){
        var sql = "SELECT A.id, P.city, P.country, G.fname, G.lname, A.title, A.price_per_person, A.duration, A.description, A.category FROM ta_activities A INNER JOIN ta_places P ON location = P.id INNER JOIN ta_guides G ON A.tour_guide = G.id WHERE A.id = ?"; 
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            console.log(results); 
            context.details = results[0]; 
            complete(); 
        }); 
    }

    function searchActivities(res, mysql, context, place, price, category, complete){
        var sql = "SELECT A.id, P.city, P.country, G.fname, G.lname, A.title, A.price_per_person, A.duration, A.description, A.category FROM ta_activities A INNER JOIN ta_places P ON location = P.id INNER JOIN ta_guides G ON A.tour_guide = G.id"; 
        var inserts =[]; 
        console.log(category); 
        if(category || place || price){
            sql += " WHERE"; 
        }
        if(category){
            sql += " A.category = ? "; 
            inserts.push(category); 
            if(place || price){
                sql += " AND "; 
            }
        }
        if(price){
            sql += " A.price_per_person <= ? "; 
            inserts.push(price); 
            if(place){
                sql += " AND "; 
            }
        }
        if(place){
            inserts.push(place); 
            sql += " A.location = ? "; 
        }
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            console.log(results); 
            console.log(sql); 
            context.activities = results; 
            console.log(context); 
            complete(); 
        }); 
    }

    router.get('/:id', function(req, res){
        var callbackCount = 0; 
        var context = {}; 
        context.jsscripts = ["updateActivity.js"]; 
        var mysql = req.app.get('mysql'); 
        getActivity(res, mysql, context, req.params.id, complete); 
        console.log("called get id route");
        context.header = "Details"; 
        function complete(){
            callbackCount++; 
            if(callbackCount >= 1){
                res.render('activityDetails', context); 
            }
        }
    }); 

    router.get('/search/database', function(req, res){
        console.log("test search route"); 
        console.log(req.query); 
        var callbackCount = 0; 
        var context = {}; 
        var mysql = req.app.get('mysql'); 
        searchActivities(res, mysql, context, req.query.place, req.query.price, req.query.category, complete); 
        context.header = "Details"; 
        function complete(){
            callbackCount++; 
            if(callbackCount >= 1){
                res.render('activitySearchResults', context); 
            }
        }
    }); 

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql'); 
        var sql = "UPDATE ta_activities SET title=?, description=?, duration=?, price_per_person=?, category=? WHERE id=?"; 
        var inserts = [req.body.title, req.body.description, req.body.duration, req.body.price, req.body.category, req.params.id]; 
        console.log(inserts); 
        sql = mysql.pool.query(sql,inserts,function(error,results,fields){
            if(error){
                console.log(error); 
                res.write(JSON.stringify(error)); 
                res.end(); 
            }else{
                res.status(200); 
                res.end(); 
            }
        }); 
    }); 

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql'); 
        var context = {}; 
        var callbackCount = 0; 
        getGuideLocation(mysql, req.body.guide, context, complete); 
        function complete(){
            callbackCount++; 
            if(callbackCount >= 1) {
                var sql = "INSERT INTO ta_activities (tour_guide, location, title, description, duration, price_per_person, category) VALUES (?,?,?,?,?,?,?)";
                var inserts = [req.body.guide, context.loc, req.body.title, req.body.description, req.body.duration, req.body.price, req.body.category];  
                sql = mysql.pool.query(sql,inserts,function(error,results,fields) {
                    if(error) {
                        console.log(error); 
                        res.write(JSON.stringify(error)); 
                        res.end(); 
                    } else {
                        res.status(200); 
                        res.redirect('/activities'); 
                    }
                }); 
            }
        }
    }); 

    router.get('/', function(req, res){
        var callbackCount = 0; 
        var context = {}; 
        context.header = "Activities"; 
        context.jsscripts = ["searchActivities.js", "checkValues.js"]; 
        var mysql = req.app.get('mysql'); 
        getActivities(res, mysql, context, complete); 
        getPlaces(res, mysql, context, complete); 
        getGuides(res, mysql, context, complete); 
        function complete(){
            callbackCount++; 
            if(callbackCount >= 3){
                res.render('activities', context); 
            }
        }
    }); 

    return router; 
}(); 
