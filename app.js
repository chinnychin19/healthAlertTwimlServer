var express = require('express');
var app = express();

// queries: 
// recipientName, 
// patientName, 
// recipientPhoneNumber, 

// statName, 
// statUnit, 

// statValue, 
// statLowerBound, 
// statUpperBound
app.get('/callTwiml', function(req, res){
    if (!validateQuery(req.query)) {
        res.status(400).send("You are missing a necessary parameter.");
    }

    var message = getMessageText(req.query);

    var output = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Response>' +
        '<Pause />' +
        '<Say voice="alice" language="en-US">' + message + '</Say>' +
        '</Response>';
    res.send(output);
    console.log(output);
});

app.get('/notifyWithCall', function(req, res) {
    var accountSid = process.env.TWILIO_SID;
    var authToken = process.env.TWILIO_AUTH_TOKEN;
    var twilioNumber = process.env.TWILIO_PHONE_NUMBER;
    var client = require('twilio')(accountSid, authToken);

    if (!validateQuery(req.query)) {
        res.status(400).send("You are missing a necessary parameter.");
    }

    console.log(req.query);

    var messageUrl = "http://dukecs408-twilio.herokuapp.com/callTwiml?";
    for (var q in req.query) {
        messageUrl += q + "=" + req.query[q] + "&";
    }
    messageUrl = messageUrl.substring(0, messageUrl.length - 1); // chop off final '&'
    messageUrl = messageUrl.replace(/\s/g, '%20'); // replace spaces with %20
    console.log(messageUrl);

    client.calls.create({
        url: messageUrl,
        to: req.query.recipientPhoneNumber,
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

app.get('/notifyWithText', function(req, res) {
    var accountSid = process.env.TWILIO_SID;
    var authToken = process.env.TWILIO_AUTH_TOKEN;
    var twilioNumber = process.env.TWILIO_PHONE_NUMBER;
    var client = require('twilio')(accountSid, authToken);

    if (!validateQuery(req.query)) {
        res.status(400).send("You are missing a necessary parameter.");
    }

    console.log(req.query);

    client.messages.create({
        to: req.query.recipientPhoneNumber,
        from: twilioNumber,
        body: getMessageText(req.query)
    }, function(err, call) {
        if (err) {
            res.send(err);
            return;
        }
        res.send("sent");
        return;
    });
});

function getMessageText(query) {
    var message = '';
    message += "Hello, "+query.recipientName+". ";
    message += "This is a notification from Health Alert concering "+query.patientName+". ";
    message += "The patient's "+query.statName + " was measured at " + query.statValue + " " + query.statUnit + ". ";
    message += "This falls outside of the prescribed range between " + query.statLowerBound + " and "+ query.statUpperBound + ". ";
    message += "You are receiving this notification because " +query.patientName + " indicated you as an emergency contact.";
    return message;
}

function validateQuery(query) {
    if (undefined == query.recipientName ||
        undefined == query.patientName ||
        undefined == query.recipientPhoneNumber ||
        undefined == query.statName ||
        undefined == query.statValue ||
        undefined == query.statUnit ||
        undefined == query.statLowerBound ||
        undefined == query.statUpperBound) {
        return false;
    }
    return true;
}

// test URL:
// http://localhost:3000/notifyWithCall?recipientName=chinmay&patientName=jeff daye&recipientPhoneNumber=7034855298&statName=power level&statValue=9001&statUnit=units&statLowerBound=0&statUpperBound=9000
// http://localhost:3000/notifyWithText?recipientName=chinmay&patientName=jeff daye&recipientPhoneNumber=7034855298&statName=power level&statValue=9001&statUnit=units&statLowerBound=0&statUpperBound=9000
// http://dukecs408-twilio.herokuapp.com/notifyWithCall?recipientName=chinmay&patientName=jeff%20daye&recipientPhoneNumber=7034855298&statName=power%20level&statValue=9001&statUnit=units&statLowerBound=0&statUpperBound=9000




var port = process.env.PORT || 3000;
app.listen(port);
