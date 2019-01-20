const mysql = require('mysql');
const credentials = require('./credentials');
const telegram = require('./telegram');

let con = mysql.createConnection({
    host: credentials.database_host,
    user: credentials.database_username,
    password: credentials.database_user_password,
    database: credentials.database_table
});

con.connect(function(err) {
    if (err) throw err;
    console.log(" > Database connection established");
    var sql = "CREATE TABLE IF NOT EXISTS results (lecture VARCHAR(255), result_type VARCHAR(255), grade VARCHAR(255))";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(" > Table created");
    })
});

function addNewResult(lectureName, resultType, grade) {
    checkResultForUpdate(lectureName, resultType).then(function (result) {
        if (result.length < 1) {
            let sql = "INSERT INTO results (lecture, result_type, grade) VALUES (?, ?, ?)";
            let values = [lectureName, resultType, grade];
            con.query(sql, values, function (err, result) {
                if (err) throw err;
            });
        }

        if (result[0]['grade'] != grade) {
            console.log(" > There is a new grade for existing result. Updating database...");
            let updateSql = "UPDATE results SET grade = ? WHERE lecture = ? AND result_type = ?";
            let updateValues = [grade, lectureName, resultType];
            con.query(updateSql, updateValues, function (err, result) {
                if (err) throw err;
            });
        }
    })
}

function checkResultForUpdate(lectureName, resultType) {
    return new Promise(function(resolve, reject) {
        let sql = "SELECT grade FROM results WHERE lecture = ? AND result_type = ?";
        let values = [lectureName, resultType];
        con.query(sql, values, function (err, result) {
            if (err) throw err;
            resolve(result);
        });
    });
}

module.exports = {
    addNewResult
}