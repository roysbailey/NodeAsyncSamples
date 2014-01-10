/**
 * Created by rbailey on 10/01/14.
 */

// JavaScript is a very simple, but often misunderstood language.
// The secret to unlocking it’s potential is understanding it’s functions.
// A function is an object that can be passed around with an attached closure.
// Functions are NOT bound to objects, the take their closure from where they are defined...

var Lane = {
    name: "Lane the Lambda",
    description: function () {
        console.log("A person named " + this.name);
    }
};

// Sample 1 - the description function is defined with the closure of "Lane" object literal, so finds a definition of "name" in that closure.
Lane.description();
// A person named Lane the Lambda

// Sample 2 - the descr function is defined within the closure of Fred, so finds a definition of "name" in that closure (event though the function points to the definition in Lane).
var Fred = {
    name: "Fred the Functor",
    descr: Lane.description
};
Fred.descr();
// A person named Fred the Functor

// Sample 3 - the description function from lane is called with an explicit new closure, passed in via the call() function, so finds a definition of "name" in that closure.
Lane.description.call({
    name: "Zed the Zetabyte"
});
// A person named Zed the Zetabyte

// Sample 4 - the descr variable is defined within the global scope, which does NOT have "name" within the closure, so finds NO definition of "name" when executing.
var descr = Lane.description;
descr();
// A person named undefined

// Sample 5 - make a closure via returning a function which has access to "name" in its closure scope.
// The new function "description" is defined within the scope of makeClosure, which has "name" as a parameter.  So, the call to description finds "name" in that closure
function makeClosure(name) {
    return function description() {
        console.log("A person named " + name);
    }
}

var description =
    makeClosure('Cloe the Closure');
description();
// A person named Cloe the Closure