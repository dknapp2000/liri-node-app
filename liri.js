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
    logger( "using random.txt file for input." );
    const random = fs.readFile( "random.txt", "UTF-8", function( err, data) {
        if ( err ) throw err;
        logger( data );
        let parts = data.split(",");
        var action = parts[0];
        let arg = parts.splice(1).join(" ");
        arg = arg.replace( /\"/g, '' );
        logger( action );
        logger( arg );
        execAction( action, arg );
    })
} else {
    execAction( action, arg );
}

function execAction( action, arg ) {    
    logger( "Action   = " + action );
    logger( "argument = " + arg );
    switch (action) {
        case 'my-tweets':
            logger( "Let's check twitter." );
            twitterCheck( arg );
            break;
        case 'spotify-this-song':
            logger( "OK, let's make some music." );
            spotCheck( arg );
            break;
        case 'movie-this':
            logger( "Bring the popcorn!" );
            omdbCheck( arg );
            break;
        case 'do-what-it-says':
        default:
            logger("Pulease choose one of " + options.join(" ") );
            break;
    }
}

function omdbCheck( arg ) {
    omdb.search( arg || 'saw', function(err, movies) {
        if (err) {
            console.error(err);
            var response = require( "./inception.json" ); 
            logger( "===========================================================================" );
            logger( "==== ATTENTION: omdb API had been experiencing problems, in the event =====" );
            logger( "==== that the process is not able to retrieve information from omdb   =====" );
            logger( "==== the process will return the locally stored omdb information for  =====" );
            logger( "==== for Inception.    Thank you.   - the management                  =====" );
            logger( "===========================================================================" );
            var movies = [ response ];
        }

        if (movies.length < 1) {
            return logger('No movies were found!');
        }

        movies.forEach(function(movie) {
            logger( "Title           : " + movie.Title );
            logger( "Year released   : " + movie.Year );
            logger( "IMDB Rating     : " + movie.imdbRating );
            logger( "Country         : " + movie.Country );
            logger( "Language        : " + movie.Language );
            logger( "Plot            : " + movie.Plot );
            logger( "Actors          : " + movie.Actors );
            logger( "Rotten tomatoes : " + movie.RottenTomatoes || 'Unavailable' );
            logger( "Rotten URL      : " + movie.RottenURL || 'Unavailable' );
        });

    });
}

function spotCheck( arg ) {
    spotify.search({ type: 'track', query: arg || 'My Zelda' }, function(err, data) {
        if ( err ) {
            logger('Error occurred: ' + err);
            return;
        }
        //logger( JSON.stringify( data, null, 4 ) );
        //logger( data.tracks.items[0].album.name );
        const album = data.tracks.items[0].album.name;
        const track = data.tracks.items[0].name;
        const preview = data.tracks.items[0].preview_url;
        let artist = "";
        for ( let i = 0; i<data.tracks.items[0].album.artists.length; i++ ) {
            artist ? artist = artist + ", " + data.tracks.items[0].album.artists[i].name : artist = data.tracks.items[0].album.artists[i].name;
        }
        logger( "artist = " + artist );
        logger( "track  = " + album );
        logger( "Track  = " + track );
        logger( "Preview= " + preview );
    });
}

var params = {screen_name: 'dknapp2000'};

function twitterCheck( arg ) { 
    client.get('statuses/user_timeline', { q: "node.js"}, function(error, tweets, response) {
        if (!error) {
            for ( var i = 0; i<20 ; i++ ) {
                let tm = new Date( tweets[i].created_at );
                let time = moment( tm );
                // logger( "JS Date: ", tm );
                logger( time.format("YYYY-MM-DD hh:mm:ss") + ": " + tweets[i].text)
            }
        } else { 
            logger( error );
        }
    });
}

function logger( msg ) {
    const message =  moment().format( 'YYYY/MM/DD.hh:mm:ss' ) + ": " + msg;   
	console.log( msg );
	fs.appendFile( logfile, message + "\n", "UTF8", function(err) {
		if ( err ) throw err;
	});
}
