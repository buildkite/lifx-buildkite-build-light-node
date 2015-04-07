// Expected env settings
var lifx_access_token = process.env.LIFX_ACCESS_TOKEN;
var bulb_selector     = process.env.BULB_SELECTOR;
var webhook_token     = process.env.WEBHOOK_TOKEN;

var https      = require('https');
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

    switch (req.body.build.state) {
      case 'running':
        console.log('Build running');
        post_to_lifx("/v1beta1/lights/" + bulb_selector + "/effects/breathe.json", {
          power_on:   false,
          color:      "yellow brightness:5%",
          from_color: "yellow brightness:35%",
          period:     5,
          cycles:     9999,
          persist:    true
        });
        break;
      case "passed":
        console.log("Build passed");
        post_to_lifx("/v1beta1/lights/" + bulb_selector + "/effects/breathe.json", {
          power_on:   false,
          color:      "green brightness:75%",
          from_color: "green brightness:10%",
          period:     0.45,
          cycles:     3,
          persist:    true,
          peak:       0.2
        });
        break;
      case "failed":
        console.log("Build failed");
        post_to_lifx("/v1beta1/lights/" + bulb_selector + "/effects/breathe.json", {
          power_on:   false,
          color:      "red brightness:60%",
          from_color: "red brightness:25%",
          period:     0.1,
          cycles:     20,
          persist:    true,
          peak:       0.2
        });
        break;
    }
  }

  res.send('AOK');
});

app.get('/', function(req, res){
  res.send("<div style=\"font:24px Avenir,Helvetica;max-width:32em;margin:2em;line-height:1.3\"><h1 style=\"font-size:1.5em\">Huzzah! You’re almost there.</h1><p style=\"color:#666\">Now create a webhook in your <a href=\"https://buildkite.com/\" style=\"color:black\">Buildkite</a> notification settings with this URL, and the webhook token from the Heroku app’s config&nbsp;variables.</p><p>https://" + req.hostname + "/</p></div>");
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Express listening on port', this.address().port);
});

function post_to_lifx(path, params) {
  var body = JSON.stringify(params);

  console.log("Posting to LIFX", path, body);

  var req = https.request({
    hostname: 'api.lifx.com',
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      "Content-type":   "application/json",
      "Connection":     "close",
      "Content-length": body.length,
      "Authorization":  "Bearer " + lifx_access_token,
    }
  }, function(res) {
    res.on("data", function(data) {
      console.log("LIFX API response", res.statusCode, data.toString());
    });
  });

  req.write(body);
  req.end();
}
