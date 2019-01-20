const mysql = require('mysql');
const credentials = require('./credentials');

let con = mysql.createConnection({
    host: credentials.database_host,
    user: credentials.database_username,
    password: credentials.database_user_password,
    database: credentials.database_table
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE IF NOT EXISTS results (lecture VARCHAR(255), result_type VARCHAR(255), grade VARCHAR(255))";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created!");
    })
});

function addNewResult(lectureName, resultType, grade) {
    let sql = "INSERT INTO results (lecture, result_type, grade) VALUES (?, ?, ?)";
    let values = [lectureName, resultType, grade];
    con.query(sql, values, function (err, result) {
        if (err) throw err;
    });
}

module.exports = {
    addNewResult
}