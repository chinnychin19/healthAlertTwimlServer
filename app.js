var express = require('express');
var app = express();

// queries: 
// nameRecipient, 
// nameConcerning, 
// phoneNumber, 
// statName, 
// statValue, 
// statUnit, 
// statLowerBound, 
// statUpperBound
app.get('/message', function(req, res){
    if (undefined == req.query.nameRecipient ||
        undefined == req.query.nameConcerning ||
        undefined == req.query.phoneNumber ||
        undefined == req.query.statName ||
        undefined == req.query.statValue ||
        undefined == req.query.statUnit ||
        undefined == req.query.statLowerBound ||
        undefined == req.query.statUpperBound) {
        res.status(400).send("You are missing a necessary parameter.");
    }

    var message = '';
    message += "Hello, "+req.query.nameRecipient+". ";
    message += "This is a notification from Health Alert concering "+req.query.nameConcerning+". ";
    message += "The patient's "+req.query.statName + " was measured at " + req.query.statValue + " " + req.query.statUnit + ". ";
    message += "This falls outside of the prescribed range between " + req.query.statLowerBound + " and "+ req.query.statUpperBound + ". ";
    message += "You are receiving this notification because " +req.query.nameConcerning + " indicated you as an emergency contact.";

    var output = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Response>' +
        '<Pause />' +
        '<Say voice="alice" language="en-US">' + message + '</Say>' +
        '</Response>';
    res.send(output);
    console.log(output);
});

app.get('/notify', function(req, res) {
    var accountSid = process.env.TWILIO_SID;
    var authToken = process.env.TWILIO_AUTH_TOKEN;
    var twilioNumber = process.env.TWILIO_PHONE_NUMBER;
    var client = require('twilio')(accountSid, authToken);

    if (undefined == req.query.nameRecipient ||
        undefined == req.query.nameConcerning ||
        undefined == req.query.phoneNumber ||
        undefined == req.query.statName ||
        undefined == req.query.statValue ||
        undefined == req.query.statUnit ||
        undefined == req.query.statLowerBound ||
        undefined == req.query.statUpperBound) {
        res.status(400).send("You are missing a necessary parameter.");
    }

    console.log(req.query);

    var messageUrl = "http://dukecs408-twilio.herokuapp.com/message?";
    for (var q in req.query) {
        messageUrl += q + "=" + req.query[q] + "&";
    }
    messageUrl = messageUrl.substring(0, messageUrl.length - 1); // chop off final '&'
    messageUrl = messageUrl.replace(/\s/g, '%20'); // replace spaces with %20
    console.log(messageUrl);

    client.calls.create({
        url: messageUrl,
        to: req.query.phoneNumber,
        from: twilioNumber,
        method: "GET"
    }, function(err, call) {
        if (err) {
            res.send(err);
            return;
        }
        res.send("sent");
        return;
    });
});

// test URL:
// http://localhost:3000/notify?nameRecipient=chinmay&nameConcerning=jeff daye&phoneNumber=7034855298&statName=power level&statValue=9001&statUnit=units&statLowerBound=0&statUpperBound=9000
// http://dukecs408-twilio.herokuapp.com/notify?nameRecipient=chinmay&nameConcerning=jeff%20daye&phoneNumber=7034855298&statName=power%20level&statValue=9001&statUnit=units&statLowerBound=0&statUpperBound=9000




var port = process.env.PORT || 3000;
app.listen(port);
