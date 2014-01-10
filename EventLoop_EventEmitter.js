/**
 * Created by rbailey on 10/01/14.
 */

// Plain callbacks are great for things that will eventually return or error out.  Request Reply Model
// But what about things that just happen sometimes or never at all.
// These general callbacks are great as events.
// Events are super powerful and ﬂexible since the listener is loosely coupled to the emitter.
// Events are a "publish/subscribe" model
// Callbacks are a "request/response"

// Events can be useful for processing data as it arrives.
//      emitter.on("item", function(item) {});         // Process as items arrive
//      getItems(param, function(err, allItems) {});    // Callback executed when ALL items are completed
//      Note.  with callbacks, you either get "all results" or an "error".  With events, may get "some results" then an error!

// The list of "events" available, provide the "contract" between the publisher and subscriber.


// There are two main patterns for using events.
//  1 - A function which returns a standard EventEmitter to a client, and then publishes events to subscribers via this (see below)
//  2 - You create a new "class" which inherits from EventEmitter and encapsulates the "function" as well as the event emission (see utils.inherits().
//      See 2-ext-emitter.js in PulralSight: "Intro to Node\materials\M3 - Streams" for an example of this.  Code very similar for 2 approaches!

var EventEmitter = require('events').EventEmitter;

var getResource = function(c) {
    var e = new EventEmitter();
    // process.nextTick, basically run this on the next loop of the event loop (so it returns straight away)
    // we can then register our handlers BEFORE the function starts!
    process.nextTick(function onNexTick() {
        var count = 0;
        e.emit('start');
        // Every 10 milliseconds, run our counter increment, and omit our data event
        var t = setInterval(function () {
            e.emit('data', ++count);
            if (count === c) {
                // If done, then emit the "end" event.
                e.emit('end', count);
                clearInterval(t);
            }
        }, 10);
    });
    return(e);
};

// r is now an instance of the eventOmitter.  We register out "event handlers" against this
// when the onNexrTick function above runs, it will then call our handlers.
var r = getResource(5);

r.on('start', function() {
    console.log("I've started!");
});

r.on('data', function(d) {
    console.log("   I received data -> " + d);
});

r.on('end', function(t) {
    console.log("I'm done, with " + t + " data events.");
});


