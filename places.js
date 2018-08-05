module.exports = function(){
    var express = require('express'); 
    var router = express.Router(); 

    function searchPlaces(res, mysql, city, country, context, complete){
        var sql = "SELECT P.id, P.city, P.country, PA.activities, PG.guides FROM ta_places P "; 
        sql += "INNER JOIN (SELECT P.id, COUNT(location) AS activities FROM ta_places P INNER JOIN ta_activities ON location = P.id GROUP BY P.id) PA ON PA.id = P.id "; 
        sql += "INNER JOIN (SELECT P.id, COUNT(services_location) AS guides FROM ta_places P INNER JOIN ta_guides ON services_location = P.id GROUP BY P.id) PG ON PG.id = P.id "; 
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

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql'); 
        var context = {}; 
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

    router .get('/', function(req, res){
        var context = {}; 
        context.jsscripts = ["searchPlaces.js"];
        context.header = "Places"; 
        res.render('places', context); 
    }); 

    return router; 
}(); 
