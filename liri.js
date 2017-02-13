var request = require("request");
var spotify = require("spotify");
var inquirer = require( "inquirer" );
var omdb = require("omdb");
var twitter = require( "twitter" );
var fs = require( "fs" );
var moment = require( "moment" );
var keys = require("./keys.js");
var options = [ 'my-tweets', 'spotify-this-song', 'movie-this', "do-what-it-says" ];

const logfile = "liri.log";

logger( "Startup" );

var client = new twitter({
  consumer_key: keys.twitterKeys.consumer_key,
  consumer_secret: keys.twitterKeys.consumer_secret,
  access_token_key: keys.twitterKeys.access_token_key,
  access_token_secret: keys.twitterKeys.access_token_secret
});

const action = process.argv[2];
const arg = process.argv.splice(3).join(" ");

if ( action === "do-what-it-says" ) {
    console.log( "using random.txt file for input." );
    const random = fs.readFile( "random.txt", "UTF-8", function( err, data) {
        if ( err ) throw err;
        console.log( data );
        let parts = data.split(",");
        var action = parts[0];
        let arg = parts.splice(1).join(" ");
        arg = arg.replace( /\"/g, '' );
        console.log( action );
        console.log( arg );
        execAction( action, arg );
    })
} else {
    execAction( action, arg );
}

function execAction( action, arg ) {    
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
}

function omdbCheck( arg ) {
    omdb.search( arg || 'saw', function(err, movies) {
        if (err) {
            console.error(err);
            var response = require( "./inception.json" ); 
            console.log( "===========================================================================" );
            console.log( "==== ATTENTION: omdb API had been experiencing problems, in the event =====" );
            console.log( "==== that the process is not able to retrieve information from omdb   =====" );
            console.log( "==== the process will return the locally stored omdb information for  =====" );
            console.log( "==== for Inception.    Thank you.   - the management                  =====" );
            console.log( "===========================================================================" );
            var movies = [ response ];
        }

        if (movies.length < 1) {
            return console.log('No movies were found!');
        }

        movies.forEach(function(movie) {
            console.log( "Title           : ", movie.Title );
            console.log( "Year released   : ", movie.Year );
            console.log( "IMDB Rating     : ", movie.imdbRating );
            console.log( "Country         : ", movie.Country );
            console.log( "Language        : ", movie.Language );
            console.log( "Plot            : ", movie.Plot );
            console.log( "Actors          : ", movie.Actors );
            console.log( "Rotten tomatoes : ", movie.RottenTomatoes || 'Unavailable' );
            console.log( "Rotten URL      : ", movie.RottenURL || 'Unavailable' );
        });

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
    client.get('statuses/user_timeline', { q: "node.js"}, function(error, tweets, response) {
        if (!error) {
            for ( var i = 0; i<20 ; i++ ) {
                let time = moment( tweets[i].created_at );
                console.log( time.format("YYYY-MM-DD HH:mm:ss"), ":", tweets[i].text)
            }
        } else { 
            console.log( error );
        }
    });
}

function logger( msg ) {
	const message =  moment().format( 'YYYY/MM/DD.hh:mm:ss' ) + ": " + msg;   
	console.log( message );
	fs.appendFile( logfile, message + "\n", "UTF8", function(err) {
		if ( err ) throw err;
	});
}
