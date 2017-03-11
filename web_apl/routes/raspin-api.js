var express = require('express');
var logics = require('../private-logics/raspin-api.logic');
var router = express.Router();


function call_stored_procedure(db,func) {
  
  // Connection URL
  var url = 'mongodb://localhost:27017/test';
  db.eval('db.loadServerScripts()',
    //err
    function(err,seq) {
      func(err,seq,db);
    }
  )

}

router.get('/ping', function(req, res, next) {
  res.send('{"status":"ok"}')
});

router.get('/AvailableControllerProvider', function(req, res, next) {
  var MongoClient = require('mongodb').MongoClient
      , assert = require('assert');
  // Connection URL
  var url = 'mongodb://localhost:27017/test';
  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, db) {
      call_stored_procedure(db, function(err,seq, db) {
        db.eval('AvailableControllerProvider()',
          function(err,seq) {
            console.log(seq)
            res.send(seq);
            db.close()
         }
        )
      });
  });

});
router.get('/SendToController', function(req, res, next) {
       logics.SendControllMessage(req.query.pvid ,req.query.message, req.query.arg, 100,res)
});
router.get('/SubscribeControlMessage', function(req, res, next) {
      logics.SubscribeControlMessage(req.query.pvid ,req.query.previous_processed_req_id, 100,res)
});
/* GET users listing. */
router.get('/AvailableDataProvider', function(req, res, next) {
  var MongoClient = require('mongodb').MongoClient
      , assert = require('assert');
  // Connection URL
  var url = 'mongodb://localhost:27017/test';
  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, db) {
      call_stored_procedure(db,function(err,seq, db) {
        db.eval('AvailableDataProvider()',
          function(err,seq) {
            console.log(seq)
            res.send(seq);
            db.close()
         }
        )
      });
  });
});
router.get('/GetOvservationData', function(req, res, next) {
  // Connection URL
  var MongoClient = require('mongodb').MongoClient
      , assert = require('assert');
  var url = 'mongodb://localhost:27017/test';
  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, db) {
      call_stored_procedure(db,function(err,seq, db) {
        var expr = 'GetOvservationData("' + req.query.pvid + '","' + req.query.previous_processed_data_id + '")'
        db.eval(expr,
          function(err,seq) {
            console.log(seq)
            res.send(seq);
            db.close()
         }
        )
      });
  });

});

module.exports = router;
