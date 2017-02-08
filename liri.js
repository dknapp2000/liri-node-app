var request = require("request");
var spotify = require("spotify");
var omdb = require("omdb");
var keys = require("./keys.js");

// console.log(request);

omdb.search('saw', function(err, movies) {
    if (err) {
        return console.error(err);
    }

    if (movies.length < 1) {
        return console.log('No movies were found!');
    }

    movies.forEach(function(movie) {
        console.log('%s (%d)', movie.title, movie.year);
    });

    // Saw (2004) 
    // Saw II (2005) 
    // Saw III (2006) 
    // Saw IV (2007) 
    // ... 
});