var express = require('express'),
    twilio  = require('twilio'),
    router  = express.Router(),
    request = require('request'),
    cheerio = require('cheerio'),
    zlib    = require('zlib'),
    minify  = require('html-minifier').minify,
    md      = require('html-md');


/* GET users listing. */
router.get('/', function(req, res) {
  'use strict';
  res.send('lolzard');
});

router.post('/sms', function(req, res) {
  'use strict';
  var resp = new twilio.TwimlResponse(),
  tURL = req.body.Body,
  msg = '';

console.log(tURL);

request(tURL, function (error, response, body) {
  var $ = cheerio.load(body);
  $('img').remove();
  $('head').remove();
  $('script').remove();
  $('link').remove();
  $('body').children().removeAttr('style');
  $('body').children().removeAttr('class');
  $('body').children().removeAttr('id');
  $('body').children().removeAttr('name');
  $('body').children().removeAttr('src');
  $('body').children().removeAttr('href');
  //    $('*').each(function() {      // iterate over all elements
  //        this[0].attribs = {};     // remove all attributes
  //    });
  msg = $('body').html();
  var lol = md(msg); 

  msg = '<html><body>'+msg+'</body></html>';
  msg = minify(msg, {collapseWhitespace:true, removeComments: true});
  console.log(msg);
  zlib.gzip(msg, function(err, result) {
    var messageToSend = new Buffer(msg).toString('base64');
    console.log(messageToSend);

    if(err) {
      throw err;
    }
    //console.log(messageToSend);
    sendIt(messageToSend, resp, res);
  });
});

function sendIt(temp, resp, sendItRes){
  var messages = new Array, slices = Math.ceil(temp.length/160);
  
  console.log("Slices:\t"+slices);

  for(var i=0;i<slices;i++){
    if(i == slices - 1)
      messages.push(i+'%'+temp.substring(i*158,(i*158+158))+'%');
    else
      messages.push(i+'%'+temp.substring(i*159,(i*159+159)));
  }

  for(var j=0;j<messages.length;j++){
    resp.message(messages[j]);
  }

  res.send(resp.toString());
}
});


module.exports = router;
