/* 
 * a Cisco Spark bot that handles orders :)
 * built at HackZurich 2016 :)
 * 
 * note : this example requires you set up a SPARK_TOKEN env
 *        variable for a real account (not a bot account), 
 *        as this code reads past messages in the room 
 *  
 */

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

// starts your Webhook with default configuration where
// the SPARK API access token is read from the
// SPARK_TOKEN env variable 
var SparkBot = require("../sparkbot/webhook");
var bot = new SparkBot();

// do not listen to ourselves
// comment the line below if you're running the
// bot from your Developer access token and
// you want to invoke in a test room
// bot.interpreter.ignoreSelf = true; 

var SparkClient = require("node-sparky");
var spark = new SparkClient({ token: process.env.SPARK_TOKEN });

var todos = [];

bot.onCommand("reset", function (command) {
    todos = [];
});

bot.onCommand("todo", function (command) {
    var message = '#### YoBot: Nothing to do. Just chill.'
    if(todos.length !== 0) {
        message = '#### YoBot: Next Yoghurts:' + todos.join(', ');
    }
   
   spark.messageSendRoom(command.message.roomId, {
       markdown: message
   });  
});


bot.onCommand("add", function (command) {

  var args = command.args;

  spark.messageSendRoom(command.message.roomId, {
      markdown: "> Adding Order with ID: " + todos.length
  });

  todos.push(args.join(' '));
});

bot.onCommand("done", function (command) {

  var index = command.args[0];

  spark.messageSendRoom(command.message.roomId, {
      markdown: "I heard you! marking yoghurt as done. :)",
      files: "http://66.media.tumblr.com/632b2603278412e8381309d60eb1d078/tumblr_njr9nvsWeW1si3gq6o1_r1_500.gif",
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


