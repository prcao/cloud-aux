var express = require('express');
const path = require('path');
var router = express.Router();

/* GET home page. */
router.get('*', (req, res) => {
  res.status(404);
});

module.exports = router;
