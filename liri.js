var request = require("request");
var spotify = require("spotify");
var omdb = require("omdb");
var twitter = require( "twitter" );
var keys = require("./keys.js");
var options = [ 'twitter-me', 'spotify', 'movie-me' ];
var action = process.argv[2];

console.log( keys );
console.log( keys.twitterKeys.consumer_key );

var client = new twitter({
  consumer_key: keys.twitterKeys.consumer_key,
  consumer_secret: keys.twitterKeys.consumer_secret,
  access_token_key: keys.twitterKeys.access_token_key,
  access_token_secret: keys.twitterKeys.access_token_secret
});

switch (action) {
    case 'twitter-me':
        break;
    case 'spotify':
        break;
    case 'movie-me':
        break;
    default:
        console.log("Pulease choose one of ", options.join(" ") );
        break;
}
// console.log(request);

// omdb.search('saw', function(err, movies) {
//     if (err) {
//         return console.error(err);
//     }

//     if (movies.length < 1) {
//         return console.log('No movies were found!');
//     }

//     movies.forEach(function(movie) {
//         console.log('%s (%d)', movie.title, movie.year);
//     });

//     // Saw (2004) 
//     // Saw II (2005) 
//     // Saw III (2006) 
//     // Saw IV (2007) 
//     // ... 
// });

spotify.search({ type: 'track', query: 'Adia' }, function(err, data) {
    if ( err ) {
        console.log('Error occurred: ' + err);
        return;
    }
    // console.log( JSON.stringify( data, null, 2 ) );
    
});

var params = {screen_name: 'dknapp2000'};

client.get('search/tweets', { q: "trump"}, function(error, tweets, response) {
  if (!error) {
    //console.log(tweets);
    for ( var i = 0; i<tweets.statuses.length; i++ ) {
        console.log( tweets.statuses[i].text)
    }
  } else { 
      console.log( error );
  }
});