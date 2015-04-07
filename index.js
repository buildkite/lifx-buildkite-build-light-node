// Expected env settings
var lifx_access_token = process.env.LIFX_ACCESS_TOKEN;
if (!lifx_access_token) throw new Error("no LIFX_ACCESS_TOKEN set");
var bulb_selector     = process.env.BULB_SELECTOR;
if (!lifx_access_token) throw new Error("no BULB_SELECTOR set");
var webhook_token     = process.env.WEBHOOK_TOKEN;
if (!lifx_access_token) throw new Error("no WEBHOOK_TOKEN set");

var express    = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.post('/', function(req, res){

  console.log('Received POST', req.headers, req.body);

  // Verify token
  if (req.headers['x-buildkite-token'] != webhook_token) {
    return res.status(401).send('Invalid token');
  }

  // Process build event
  if (req.headers['x-buildkite-event'] == 'build') {
    console.log('Processing build event');
  }

  res.send('AOK');
});

app.get('/', function(req, res){
  res.send("<div style=\"font:24px Avenir,Helvetica;max-width:32em;margin:2em;line-height:1.3\"><h1 style=\"font-size:1.5em\">Huzzah! You’re almost there.</h1><p style=\"color:#666\">Now create a webhook in your <a href=\"https://buildkite.com/\" style=\"color:black\">Buildkite</a> notification settings with this URL, and the webhook token from the Heroku app’s config&nbsp;variables.</p><p>https://" + req.hostname + "/</p></div>");
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Express listening on port', this.address().port);
});