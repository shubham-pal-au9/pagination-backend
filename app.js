var express = require("express");
var http = require("http");
// access mysql package
var mysql = require("mysql");
var app = express();
// create mysql pool for multiple connections

var pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "12345",
  database: "cosmic_assian",
  multipleStatements: true,
});

app.get("/api/products", getAllProducts);
// Create HTTP Server
var server = http.createServer(app);
// Indicate port 3000 as host
var port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log("Server listening on port %d", port);
});
function getAllProducts(req, res) {
  // limit as 20
  const limit = 5;
  // page number
  const page = req.query.page;
  // calculate offset
  const offset = (page - 1) * limit;
  // query for fetching data with page number and offset
  const prodsQuery = "select * from users limit " + limit + " OFFSET " + offset;
  pool.getConnection(function (err, connection) {
    connection.query(prodsQuery, function (error, results, fields) {
      // When done with the connection, release it.
      connection.release();
      if (error) throw error;
      // create payload
      var jsonResult = {
        products_page_count: results.length,
        page_number: page,
        products: results,
      };
      // create response
      var myJsonString = JSON.parse(JSON.stringify(jsonResult));
      res.statusMessage = "Products for page " + page;
      res.statusCode = 200;
      res.json(myJsonString);
      res.end();
    });
  });
}
