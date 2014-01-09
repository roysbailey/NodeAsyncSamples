/**
 * Created by Roy on 09/01/14.
 */
var fs = require('fs');

// Composite function.
// An entry point to a process that does something which may have many internal "async" stages and will therefore take many "event loops" to complete
// A client is not concerned with the internal steps, only with the overall goal of the composite function.
// A client would want to use the usual callback(err, data) to get the final results.

// The example below, loads a file.  It accepts the filename of the file to load, and also the standard node (err, data) callback as the second param.
// The following sequence of events occurs
// Client -> readFile(file, callback)
//  readfile -> fs.Open
//      fs.Open -> onOpen (via event loop call back)
//      onOpen -> getChunk
//      getChunk -> fs.Read ****
//      fs.read -> onRead  (via event loop call back)
//      onRead ->  getChunk (if more data - which causes logical looping to step *** above)
//      onRead ->  done (if NO more data)
//      done -> mergeBuffers
//      done -> callback(null, data)

// Easy error handling in call backs...
// onOpen and onRead are both used as standard node callbacks (taking err, data) and passed into fs.open and fs.read.
// However, they created using a wrapper function, which takes two params, a handler function (called if there is no error on the callback from either fs.open or fs.read)
// as well as a second parameter, which is the callback provided to the entire composite function (our readFile function).
// In an error is encountered, either in the callback from fs.open / fs.read, or when executing the handler passed in the first parameter
// then the callback defined in the second parameter (the outer callback provided to the composite function), is called with the error
// This neat wrapper is handy to encapsulate those incremental step callbacks, and provides a neat way to inform the caller of the error

// If there was no error in the composite function, eventually, there will be no more chunks to read, and the onRead method will call done()
// Done is basically, the "End State" of the composite function.  Done has the responsibility to perform an aggregation of results (merge all
// the buffers read in chunks in this example), and then call the "outer callback" passed into the composite function with the final results.

function readFile(filename, callback) {
    var result = [],
        fd,
        chunkSize = 40 * 1024,
        position = 0,
        buffer;

    var onOpen = wrap(function onOpen(descriptor) {
            fd = descriptor;
            getChunk();
        },
        callback);

    var onRead = wrap(function onRead(bytesRead) {
            if (!bytesRead)
                return done();
            if (bytesRead < buffer.length) {
                var chunk = new Buffer(bytesRead);
                buffer.copy(chunk, 0, 0, bytesRead);
                buffer = chunk;
            }
            result.push(buffer);
            position += bytesRead;
            getChunk();
        },
        callback
    );

    function getChunk() {
        buffer = new Buffer(chunkSize);
        fs.read(fd, buffer, 0,
            chunkSize, position, onRead);
    }
    function done() {
        fs.close(fd);
        callback(null, mergeBuffers(result));
    }

    function mergeBuffers(buffers) {
        if (buffers.length === 0) return new Buffer(0);
        if (buffers.length === 1) return buffers[0];
        var total = 0, offset = 0;
        buffers.forEach(function (chunk) {
            total += chunk.length;
        });
        var buffer = new Buffer(total);
        buffers.forEach(function (chunk) {
            chunk.copy(buffer, offset);
            offset += chunk.length;
        });
        return buffer;
    }

    fs.open(filename, 'r', onOpen);
}

readFile("c:\\data\\temp.html", function(err, data){
    if (err) {
        console.log('Failed to read file - Error: ' + err);
    } else {
        console.log('File read -size: ' + data.length);
    }
});

// Providers a wrapper around a standard node async callback function.
// It handles errors in:
//      The original callback (if err is set)
//      And also if "handler" fails.
// Is an error does occur, it is notified to the passed in "callback" to the composite can be set
// Handler, would generally invoke some new action (step) whic would result in the next async operation
function wrap(handler, callback) {
    return function wrapper(err, result) {
        if (err) return callback(err);
        try {
            handler(result);
        } catch (err) {
            callback(err);
        }
    }
}