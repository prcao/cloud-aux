var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("???");
  res.json({ "test" : "test" });
});

module.exports = router;
