/**
 * Created by Roy on 09/01/14.
 */

//The true power in non-blocking code is parallel I/O made easy.
// You can do other things while waiting.
// You can wait on more than one thing at a time.
// Organize your logic into chunks of serial actions, and
// then run those chunks in parallel.

var fs = require('fs');
var path = require('path');

// Composite function to find all the files in a directory, and read their contents into memory.
// The final result is loaded into an array, which is passed to "callback" on completion.
// This shows how to use a callback "count" to understand when the entire process is completed (all files are loaded async in parallel)
// And how to inform the caller (via the callback) when the entire process is done.
// This provides the caller, a very simple API to make the request, and get a single notification when the whole thing is done!
// Example usage:  loadDir("c:\\temp", function(err, results){console.log('Processed %d files', results.length);});

function loadDir(directory, callback) {
    fs.readdir(directory, function onReaddir(err, files) {
        if (err) return callback(err);
        var count, results = [];

        // Trim down the list to only those directory entries which are files (not other directories)
        var filteredFiles = files.map(function (file) {
            return path.join(directory, file);
        }).filter(function (file) {
            return fs.statSync(file).isFile();
        });

        // This is the callback count.  We use this to determine when all the files have been read!
        count = filteredFiles.length;

        filteredFiles.forEach(function (filename) {
            fs.readFile(filename, function onRead(err, data) {
                if (err) return callback(err);
                results.push({ file: filename, payLoad: data});
                if (--count === 0)
                    callback(null, results);        // Now we have read all the files, call the external callback.
            });
        });

        // No files in folder condition.
        if (count === 0) callback(null, results);
    });
}

loadDir("c:\\temp", function(err, results){
    if (err) {
        console.log('Failed to load dir - Error: ' + err);
    } else {
        console.log('Load dir succeeded - found this many files: ' + results.length);
        results.forEach(function(result){
            console.log("%s (%s)", result.file, path.extname(result.file));
        });
    }
});

