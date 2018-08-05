var mysql = require('mysql'); 
var pool = mysql.createPool({
    connectionLimit : 10, 
    host            : 'classmysql.engr.oregonstate.edu', 
    user            : 'cs340_blanchlu', 
    password        : '6053', 
    database        : 'cs340_blanchlu'
}); 

module.exports.pool = pool; 
