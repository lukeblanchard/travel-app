module.exports = function(){
    var express = require('express'); 
    var router = express.Router(); 

    function searchTravelers(res, mysql, fname, lname, username, context, complete){
        var sql = "SELECT fname, lname, username FROM ta_travelers "; 
        var inserts = []; 
        if(fname || lname || username){ 
            sql += "WHERE"; 
        }
        if(fname){
            sql += " fname = ? "; 
            inserts.push(fname); 
            if(lname || username){
                sql += " AND "; 
            }
        }
        if(lname){
            sql += " lname = ? "; 
            inserts.push(lname); 
            if(username){
                sql += " AND "; 
            }
        }
        if(username){
            sql += " username = ? "; 
            inserts.push(username); 
        }
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            context.travelers = results; 
            complete(); 
        }); 
    }

    function checkRecords(mysql, username, context, complete){
        var sql = "SELECT id FROM ta_travelers WHERE username = ?"; 
        var inserts = [username]; 
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

    router.get('/search/database', function(req, res){
        var callbackCount = 0; 
        var context = {}; 
        var mysql = req.app.get('mysql'); 
        searchTravelers(res, mysql, req.query.fname, req.query.lname, req.query.username, context, complete); 
        context.header = "Details"; 
        function complete(){
            callbackCount++; 
            if(callbackCount >= 1){
                res.render('travelersSearchResults', context); 
            }
        }
    }); 

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql'); 
        var context = {}; 
        context.jsscripts = ["searchTravelers.js", "checkTravelerValues.js"];
        context.addOperation = true; 
        var callbackCount = 0; 
        checkRecords(mysql, req.body.username, context, complete); 
        function complete(){
            callbackCount++; 
            if(callbackCount >= 1) {
                if(!context.recordExists){
                    console.log("new record"); 
                    var sql = "INSERT INTO ta_travelers (fname, lname, username) VALUES (?,?,?)";
                    var inserts = [req.body.fname, req.body.lname, req.body.username];  
                    sql = mysql.pool.query(sql,inserts,function(error,results,fields) {
                        if(error) {
                            console.log(error); 
                            res.write(JSON.stringify(error)); 
                            res.end(); 
                        } else {
                            res.status(200); 
                            res.render('travelers', context); 
                        }
                    }); 
                }
                else {
                    console.log("record already exists"); 
                    res.render('travelers', context); 
                }
            }
        }
    }); 

    router.get('/', function(req, res){
        var context = {}; 
        context.jsscripts = ["searchTravelers.js", "checkTravelerValues.js"];
        context.header = "Travelers"; 
        res.render('travelers', context); 
    }); 

    return router; 
}(); 
