module.exports = function(){
    var express = require('express'); 
    var router = express.Router(); 

    function checkRecords(mysql, username, context, complete){
        var sql = "SELECT id FROM ta_travelers WHERE username = ?"; 
        var inserts = [username]; 
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            if(results.length == 0){
                context.recordDoesNotExist = true; 
            }
            else {
                context.recordDoesNotExist = false; 
            }
            console.log(results); 
            complete(); 
        }); 
    }

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

    function getUserId(res, mysql, context, username, complete){
        var sql = "SELECT id FROM ta_travelers WHERE username = ?"; 
        var inserts = [username]; 
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            console.log("getUserId results"); 
            console.log(results); 
            console.log(results[0].id); 
            context.userID = results[0].id; 
            complete(); 
        }); 
    }

    function deleteReview(res, mysql, context, userID, complete){
        var sql = "DELETE FROM ta_reviews WHERE tid = ?";
        var inserts = [userID]; 
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            console.log("DELETED"); 
            complete(); 
        }); 
    }

    function updateGuideReview(res, context, mysql, gid, complete){
        var sql = "UPDATE ta_guides SET review = (SELECT AVG(rating) FROM ta_reviews WHERE gid = ? GROUP BY gid)"; 
        var inserts = [gid]; 
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            console.log("UPDATED REVIEW"); 
            complete(); 
        }); 
    }

    //TODO: Finish this function
    function reviewGuide(res, mysql, context, gid, userID, rating, complete){
        var sql = "INSERT INTO ta_reviews (gid, tid, rating) VALUES (?, ?, ?)"  
        inserts = [gid, userID, rating]; 
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error)); 
                res.end(); 
            }
            console.log("REVIEW UPDATEd"); 
            complete(); 
        }); 
    }

    function getGuide(res, mysql, context, gid, complete){
        var sql = "SELECT G.id, fname, lname, review, P.city, P.country FROM ta_guides G INNER JOIN ta_places P ON services_location = P.id WHERE G.id = ?"; 
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
            if(place || lname){
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
    
    //TODO: Finish this route
    router.post('/reviews', function(req, res){
        console.log("GID ", req.body.gid); 
        var callbackCount = 0; 
        var context = {}; 
        var mysql = req.app.get('mysql'); 
        checkRecords(mysql, req.body.username, context, complete); 
        function complete(){
            callbackCount++; 
            if(callbackCount == 1){
                if(context.recordDoesNotExist) {
                   res.render('reviewResults', context)
                }
                else {
                    getUserId(res, mysql, context, req.body.username, complete); 
                }
            }
            if(callbackCount == 2){
                deleteReview(res, mysql, context, context.userID, complete); 
            }
            if(callbackCount == 3){
                console.log("callback == 2"); 
                reviewGuide(res, mysql, context, req.body.gid, context.userID, req.body.rating, complete);
            }
            if(callbackCount == 4){
                console.log("callback == 3"); 
                updateGuideReview(res, context, mysql, req.body.gid, complete); 
            }
            if(callbackCount == 5){
                getGuide(res, mysql, context, req.body.gid, complete); 
            }
            if(callbackCount == 6){
                getGuideActivities(res, mysql, context, req.body.gid, complete); 
            }
            if(callbackCount == 7){
                res.render('reviewResults', context); 
            }
        }
    }); 

    router.post('/reviews/delete', function(req, res){
        console.log('TESTING REVIEW PUT'); 
        var callbackCount = 0; 
        var context = {}; 
        var mysql = req.app.get('mysql'); 
        checkRecords(mysql, req.body.username, context, complete); 
        function complete(){
            callbackCount++; 
            if(callbackCount == 1){
                console.log("Delete Route ", callbackCount); 
                if(context.recordDoesNotExist) {
                   res.render('reviewResults', context)
                }
                else {
                    getUserId(res, mysql, context, req.body.username, complete); 
                }
            }
            if(callbackCount == 2){
                console.log("Delete Route ", callbackCount); 
                deleteReview(res, mysql, context, context.userID, complete); 
            }
            if(callbackCount == 3){
                console.log("Delete Route ", callbackCount); 
                context.deletedReview = true; 
                res.render('reviewResults', context)
            }
        }
    }); 

    router.get('/:id', function(req, res){
        var callbackCount = 0; 
        var context = {}; 
        context.jsscripts = ["reviewGuide.js"]; 
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

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql'); 
        var context = {}; 
        context.jsscripts = ["searchGuides.js", "checkGuideValues.js"]; 
        var callbackCount = 0; 
        var sql = "INSERT INTO ta_guides (fname, lname, services_location, email_contact) VALUES (?,?,?,?)";
        var inserts = [req.body.fname, req.body.lname, req.body.place, req.body.email];  
        sql = mysql.pool.query(sql,inserts,function(error,results,fields) {
            if(error) {
                console.log(error); 
                res.write(JSON.stringify(error)); 
                res.end(); 
            } else {
                res.status(200); 
                context.guideAdded = true; 
                res.render('guides', context);  
            }
        }); 
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
        context.jsscripts = ["searchGuides.js", "checkGuideValues.js"]; 
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
