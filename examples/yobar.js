/* 
 * a Cisco Spark bot that computes stats for a room
 * 
 * note : this example requires you set up a SPARK_TOKEN env variable for a real account (not a bot account), 
 *     as this code reads past messages in the room 
 *  
 */

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

// Starts your Webhook with default configuration where the SPARK API access token is read from the SPARK_TOKEN env variable 
var SparkBot = require("../sparkbot/webhook");
var bot = new SparkBot();

// do not listen to ourselves
// comment the line below if you're running the bot from your Developer access token and you want to invoke in a test room
//bot.interpreter.ignoreSelf = true; 

var SparkClient = require("node-sparky");
var spark = new SparkClient({ token: process.env.SPARK_TOKEN });

var todos = [];
todos[111] = 'Yoghurt Sepp Blatter';
todos[112] = 'Yoghurt Käsefüsse';

bot.onCommand("todo", function (command) {
    spark.messageSendRoom(command.message.roomId, {
        markdown: "#YoBot: We need to do the following yoghurts next:\n" + todos.join("\n")
    });
});


bot.onCommand("add", function (command) {

  var args = command.args;

  spark.messageSendRoom(command.message.roomId, {
      markdown: "_heard you ! adding yoghurt to the queue"
  });

  todos[1] = 'lol';
});

bot.onCommand("remove", function (command) {

  var index = command.args[0];

  spark.messageSendRoom(command.message.roomId, {
      markdown: "_heard you ! marking yoghurt as done"
  });

  todos[index] = undefined;
});


bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
    if (newMembership.personId == bot.interpreter.person.id) {
        debug("bot's just added to room: " + trigger.data.roomId);

        // so happy to join
        spark.messageSendRoom(trigger.data.roomId, {
            text: "Hi, I am so happy to join !"
        })
            .then(function (message) {
                spark.messageSendRoom(trigger.data.roomId, {
                    markdown: "I am all about Stats for your Spark rooms\n\n- /help\n\n- /stats [#messages]"
                });;
            });
    }
});


function isIncomingIntegration(message) {
    var matched = message.personEmail.match(/--\d+@/);
    if (!matched) {
        return false;
    }

    fine("identified as integration: " + message.personEmail);
    return true;
}


