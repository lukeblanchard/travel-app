module.exports = function(){
    var express = require('express'); 
    var router = express.Router(); 

    function getPlaceDetails(res, mysql, pid, context, complete){
        var sql = "SELECT id, city, country FROM ta_places WHERE id = ?"
        var inserts = [pid]; 
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            context.details = results[0]; 
            console.log(context);
            complete(); 
        }); 
    }

    function getPlaceActivities(res, mysql, pid, context, complete){
        var sql = "SELECT id, title FROM ta_activities P WHERE location = ?"; 
        var inserts = [pid]; 
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            context.activities = results; 
            complete(); 
        }); 
    }

    function getPlaceGuides(res, mysql, pid, context, complete){
        var sql = "SELECT id, fname, lname FROM ta_guides WHERE services_location = ?"; 
        var inserts = [pid]; 
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            context.guides = results; 
            complete(); 
        }); 
    }


    function searchPlaces(res, mysql, city, country, context, complete){
        var sql = "SELECT P.id, P.city, P.country, PA.activities, PG.guides FROM ta_places P "; 
        sql += "LEFT JOIN (SELECT P.id, COUNT(location) AS activities FROM ta_places P LEFT JOIN ta_activities ON location = P.id GROUP BY P.id) PA ON PA.id = P.id "; 
        sql += "LEFT JOIN (SELECT P.id, COUNT(services_location) AS guides FROM ta_places P LEFT JOIN ta_guides ON services_location = P.id GROUP BY P.id) PG ON PG.id = P.id "; 
        var inserts = []; 
        if(city || country){ 
            sql += "WHERE"; 
        }
        if(city){
            sql += " city = ? "; 
            inserts.push(city); 
            if(country){
                sql += " AND "; 
            }
        }
        if(country){
            sql += " country = ? "; 
            inserts.push(country); 
        }
        sql += "GROUP BY P.id";
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            context.places = results; 
            complete(); 
        }); 
    }

    function checkRecords(mysql, city, country, context, complete){
        var sql = "SELECT id FROM ta_places WHERE city = ? AND country = ?"; 
        var inserts = [city, country]; 
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            if(results.length == 0){
                context.recordExists = false; 
            }
            else {
                context.recordExists = true; 
            }
            console.log(results); 
            complete(); 
        }); 
    }

    router.get('/:id', function(req, res){
        var callbackCount = 0; 
        var context = {}; 
        var mysql = req.app.get('mysql'); 
        getPlaceDetails(res, mysql, req.params.id, context, complete); 
        getPlaceActivities(res, mysql, req.params.id, context, complete); 
        getPlaceGuides(res, mysql, req.params.id, context, complete); 
        context.header = "Details"; 
        function complete(){
            callbackCount++; 
            if(callbackCount >= 3){
                res.render('placeDetails', context); 
            }
        }
    });

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql'); 
        var context = {}; 
        context.jsscripts = ["searchPlaces.js", "checkPlaceValues.js"];
        context.addOperation = true; 
        var callbackCount = 0; 
        checkRecords(mysql, req.body.city, req.body.country, context, complete); 
        function complete(){
            callbackCount++; 
            if(callbackCount >= 1) {
                if(!context.recordExists){
                    console.log("new record"); 
                    var sql = "INSERT INTO ta_places (city, country) VALUES (?,?)";
                    var inserts = [req.body.city, req.body.country];  
                    sql = mysql.pool.query(sql,inserts,function(error,results,fields) {
                        if(error) {
                            console.log(error); 
                            res.write(JSON.stringify(error)); 
                            res.end(); 
                        } else {
                            res.status(200); 
                            res.render('places', context); 
                        }
                    }); 
                }
                else {
                    console.log("record already exists"); 
                    res.render('places', context); 
                }
            }
        }
    }); 

    router.get('/search/database', function(req, res){
        console.log("test search route"); 
        console.log(req.query); 
        var callbackCount = 0; 
        var context = {}; 
        var mysql = req.app.get('mysql'); 
        searchPlaces(res, mysql, req.query.city, req.query.country, context, complete); 
        context.header = "Details"; 
        function complete(){
            callbackCount++; 
            if(callbackCount >= 1){
                res.render('placesSearchResults', context); 
            }
        }
    }); 

    router.get('/', function(req, res){
        var context = {}; 
        context.jsscripts = ["searchPlaces.js", "checkPlaceValues.js"];
        context.header = "Places"; 
        res.render('places', context); 
    }); 

    return router; 
}(); 
