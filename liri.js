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
        case 'tmdb-this':
            logger( "Buy out the eight o'clock show!" );
            tmdbCheck( arg );
            break;
        case 'do-what-it-says':
        default:
            logger("Pulease choose one of " + options.join(" ") );
            break;
    }
}

function tmdbCheck( arg ) {
    var urlTemplate = 'https://api.themoviedb.org/3/search/movie?api_key=22c485953fb4e0c2ba44c7e3148b7d3f&query=!MOVIE!';
    var movie = arg.replace( /\s+/g, '+' );
    var url = urlTemplate.replace( /!MOVIE!/, movie );

    request( url, function( err, response, body ) {
        if ( err ) throw err;

        var resp = JSON.parse( body );
        var inquiry = [{
            name: "movie",
            message: "Please select: ",
            type: "list",
            choices: [],
        }];

        if ( resp.results.length > 1 ) { 
            for ( let i = 0; i<resp.results.length; i++ ) {
                let release_year = resp.results[i].release_date ? "(" + resp.results[i].release_date.substring(0,4) + ")" : "";
                let choice = { 
                    value: resp.results[i].id,
                    name: `${resp.results[i].title} ${release_year}`
                }
                inquiry[0].choices.push( choice );
            }
            inquiry[0].message = `There were ${resp.results.length} movies found when searching for '${movie}', Please choose one:`;
            inquirer.prompt( inquiry )
            .then( function( answer ) {
                showTmdbMovie( answer.movie );
            })
        } else {
            showTmdbMovie( resp.results[0].id );
        }
    })
}

function showTmdbMovie( movieId ) {
    var urlTemplate = 'https://api.themoviedb.org/3/movie/!MOVIE-ID!?api_key=22c485953fb4e0c2ba44c7e3148b7d3f';
    var movie = arg.replace( /\s+/g, '+' );
    var url = urlTemplate.replace( /!MOVIE-ID!/, movieId );

    request( url, function( err, response, body ) {
        var resp = JSON.parse( body );
            logger( `Title ${resp.title} (${resp.tagline})`)
            logger( "Title           : " + resp.Title );
            logger( "Year released   : " + resp.release_date );
            logger( "Country         : " + resp.production_countries[0].iso_3166_1 );
            logger( "Language        : " + resp.spoken_languages[0].name );
            logger( "Plot            : " + resp.overview );
    })
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
