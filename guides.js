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

    function getGuide(res, mysql, context, gid, complete){
        var sql = "SELECT fname, lname, review, P.city, P.country FROM ta_guides G INNER JOIN ta_places P ON services_location = P.id WHERE G.id = ?"; 
        var inserts = [gid]; 
        mysql.pool.query(sql, inserts, function(error, results, fields) {
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            context.details = results[0]; 
            console.log(context); 
            complete(); 
        }); 
    }

    function getGuideActivities(res, mysql, context, gid, complete){
        var sql = "SELECT id, title FROM ta_activities WHERE tour_guide = ?"; 
        var inserts = [gid]; 
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            context.activities = results; 
            complete(); 
        }); 
    }
    
    function getGuideReviews(res, mysql, context, gid, complete){
        var sql = "SELECT AVG(rating) AS average_rating FROM ta_reviews WHERE gid = ? GROUP BY gid"; 
        var inserts = [gid]; 
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            if(results.length == 0) {
                context.ratingExists = false; 
            }
            else {
                context.rating = results; 
            }
            complete(); 
        }); 
    }

    function searchGuides(res, mysql, context, fname, lname, place, complete){
        var sql = "SELECT G.id, G.fname, G.lname, P.city, P.country FROM ta_guides G INNER JOIN ta_places P ON services_location = P.id"; 
        var inserts = []; 
        if(fname || lname || place){
            sql += " WHERE"; 
        }
        if(fname){
            sql += " G.fname = ?"; 
            inserts.push(fname); 
            if(fname || lname){
                sql += " AND"; 
            }
        }
        if(lname){
            sql += " G.lname = ?"; 
            inserts.push(lname); 
            if(place){
                sql += " AND"; 
            }
        }
        if(place){
            inserts.push(place); 
            sql += " G.services_location = ?"; 
        }
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            console.log(results); 
            console.log(sql); 
            context.guides = results; 
            console.log(context); 
            complete(); 
        }); 
    }


    router.get('/:id', function(req, res){
        var callbackCount = 0; 
        var context = {}; 
        context.jsscripts = ["updateActivity.js"]; 
        var mysql = req.app.get('mysql'); 
        getGuide(res, mysql, context, req.params.id, complete); 
        getGuideActivities(res, mysql, context, req.params.id, complete); 
        context.header = "Details"; 
        function complete(){
            callbackCount++; 
            if(callbackCount >= 2){
                res.render('guideDetails', context); 
            }
        }
    }); 

    router.get('/search/database', function(req, res){
        console.log("test search route"); 
        console.log(req.query); 
        var callbackCount = 0; 
        var context = {}; 
        var mysql = req.app.get('mysql'); 
        searchGuides(res, mysql, context, req.query.fname, req.query.lname, req.query.place, complete); 
        context.header = "Details"; 
        function complete(){
            callbackCount++; 
            if(callbackCount >= 1){
                res.render('guideSearchResults', context); 
            }
        }
    }); 

    router.get('/', function(req, res){
        var context = {}; 
        var mysql = req.app.get('mysql'); 
        var callbackCount = 0; 
        context.jsscripts = ["searchGuides.js"]; 
        context.header = "Guides"; 
        getPlaces(res, mysql, context, complete); 
        function complete(){
            callbackCount++; 
            if(callbackCount >= 1){
                res.render('guides', context); 
            }
        }
    }); 

    return router; 
}(); 
