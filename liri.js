var request = require("request");
var spotify = require("spotify");
var inquirer = require( "inquirer" );
var omdb = require("omdb");
var twitter = require( "twitter" );
var keys = require("./keys.js");
var options = [ 'my-tweets', 'spotify-this-song', 'movie-this', "do-what-it-says" ];

var client = new twitter({
  consumer_key: keys.twitterKeys.consumer_key,
  consumer_secret: keys.twitterKeys.consumer_secret,
  access_token_key: keys.twitterKeys.access_token_key,
  access_token_secret: keys.twitterKeys.access_token_secret
});

const action = process.argv[2];
const arg = process.argv.splice(3).join(" ");

console.log( "Action   = " + action );
console.log( "argument = " + arg );

    
switch (action) {
    case 'my-tweets':
        console.log( "Let's check twitter." );
        twitterCheck( arg );
        break;
    case 'spotify-this-song':
        console.log( "OK, let's make some music." );
        spotCheck( arg );
        break;
    case 'movie-this':
        console.log( "Bring the popcorn!" );
        omdbCheck( arg );
        break;
    case 'do-what-it-says':
    default:
        console.log("Pulease choose one of ", options.join(" ") );
        break;
}


function omdbCheck( arg ) {
    omdb.search( arg || 'saw', function(err, movies) {
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
}

function spotCheck( arg ) {
    spotify.search({ type: 'track', query: arg || 'My Zelda' }, function(err, data) {
        if ( err ) {
            console.log('Error occurred: ' + err);
            return;
        }
        //console.log( JSON.stringify( data, null, 4 ) );
        //console.log( data.tracks.items[0].album.name );
        const album = data.tracks.items[0].album.name;
        const track = data.tracks.items[0].name;
        const preview = data.tracks.items[0].preview_url;
        let artist = "";
        for ( let i = 0; i<data.tracks.items[0].album.artists.length; i++ ) {
            artist ? artist = artist + ", " + data.tracks.items[0].album.artists[i].name : artist = data.tracks.items[0].album.artists[i].name;
        }
        console.log( "artist = ", artist );
        console.log( "track  = ", album );
        console.log( "Track  = ", track );
        console.log( "Preview= ", preview );
    });
}

var params = {screen_name: 'dknapp2000'};

function twitterCheck( arg ) { 
    client.get('search/tweets', { q: "node.js"}, function(error, tweets, response) {
        if (!error) {
            for ( var i = 0; i<tweets.statuses.length; i++ ) {
                console.log( tweets.statuses[i].text)
            }
        } else { 
            console.log( error );
        }
    });
}