//===============================     VARIABLES      =========================================


var fs = require("fs");
var dotenv = require("dotenv").config();
var request = require("request");
var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var spotify = new Spotify(keys.spotify);
var command = process.argv[2];
var nodeArgs = process.argv;

//===============================     FUNCTIONS      =========================================

//===============================     TWITTER        =========================================


function getTweets() {
   
    var client = new Twitter(keys.twitter);
    var params = { screen_name: "theNodest" };
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (error) {
          console.log(error);
        } else {
            var tweetHead = `
===============================   ${command} : ${params.screen_name}   =============================
            `
        console.log(tweetHead);
        fs.appendFile("log.txt", tweetHead, function(error) {
            if(error) {
                throw error;
            }
        });
        for(var i=0; i<5; i++) {
            var time = tweets[i].created_at;
            var timeFix = time.split(' ').slice(0,4).join(' ') + "\n";

            var tweetResults = "\n' " + tweets[i].text + " '  " + "\n--" + tweets[i].user.screen_name + ", " + timeFix;
            
            
            console.log(tweetResults);
            fs.appendFile("log.txt", tweetResults, function(error) {
                if(error) {
                    throw error;
                }
            });
            
            }
        }
      });
    }



//===============================     SPOTIFY        =========================================


function getSong(song) {
   
    var songName = '';
    //if no song is specified default ====> ace of base 
    if(!process.argv[3] && !song) {
        songName = 'The Sign Ace of Base';
    //if a song is passed in without command (through txt file)
    } else if(song && !process.argv[3]) {
        songName = song;
    } else {
        song = songName;
    }

    //nodeArgs = process.argv;
    for (var i = 3; i < nodeArgs.length; i++) {

        if (i > 3 && i < nodeArgs.length) {
        songName = songName + "+" + nodeArgs[i];
        } else {
        songName += nodeArgs[i];
        }
      }
      

    spotify.search({
        type: "track",
        query: songName,
        limit: 1

    }, function(error, data) {
        var info = data.tracks.items[0];
        if(error) {
            console.log(error);
    } else {
        var songHead =`
===============================   ${command} : ${songName}   =============================
        `; 
        if(info.preview_url === null){
         let songResults = `
    *Artist:    ${info.artists[0].name}
    *Track:     ${info.name}    
    *Album:     ${info.album.name}
    *Link:      ${info.external_urls.spotify}
    `;  
    songResults = songHead + songResults;
    console.log(songResults);
    fs.appendFile("log.txt", songResults, function(error){
        if(error){
            console.log("ERROR");
            throw error;
        }
    });
        } else {
        let songResults = `
    *Artist:    ${info.artists[0].name}
    *Track:     ${info.name}    
    *Album:     ${info.album.name}
    *URL:       ${info.preview_url}
    `; 
    songResults = songHead + songResults;
    console.log(songResults);
    fs.appendFile("log.txt", songResults, function(error){
        if(error){
            console.log("ERROR");
            throw error;
        }
    });  
        
            }

           
        }

    });
 
}

//===============================     OMDB        =========================================
function getMovie() {
           
    var movieName ="";
    for (var i = 3; i < nodeArgs.length; i++) {
        if (i > 3 && i < nodeArgs.length) {
          movieName = movieName + "+" + nodeArgs[i];
        } else {      
          movieName += nodeArgs[i];
        }
      }
    //if no movie is chosen default ===> mr.nobody
    if(movieName === ""){ movieName = 'mr nobody';}

    var url = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
    
request(url, function(error, res, body){
    if(error){
            console.log("Error: " + error);
    } else {
            console.log("statusCode: " + res.statusCode);
            var bodObj = JSON.parse(body);
           
        if(!bodObj.Ratings[1]) {

           
            let movieResults = `
    *Title:                     ${bodObj.Title}
    *Release Year:              ${bodObj.Year}
    *IMDB Rating:               ${bodObj.imdbRating}
    *Rotten Tomatoes Rating:    No Data
    *Country:                   ${bodObj.Country}
    *Language:                  ${bodObj.Language}
    *Plot:                      ${bodObj.Plot}
    *Actors:                    ${bodObj.Actors}`;
   
    let movieHead = `=============================   "${command}" : ${movieName}   ============================
    `;
    movieResults = movieHead + movieResults;
     console.log(movieResults);
    fs.appendFile("log.txt", movieResults, function(error){
        if(error){
            console.log("ERROR");
            throw error;
        }
    });
  
        } else if(bodObj.Ratings[1].Value){
            let movieResults = `
    *Title:                     ${bodObj.Title}
    *Release Year:              ${bodObj.Year}
    *IMDB Rating:               ${bodObj.imdbRating}
    *Rotten Tomatoes Rating:    ${bodObj.Ratings[1].Value}
    *Country:                   ${bodObj.Country}
    *Language:                  ${bodObj.Language}
    *Plot:                      ${bodObj.Plot}
    *Actors:                    ${bodObj.Actors}`;
    let movieHead = `===============================   ${command} : ${movieName}   =============================
    `;
    movieResults = movieHead + movieResults;
    console.log(movieResults);
    fs.appendFile("log.txt", movieResults, function(error){
        if(error){
            console.log("ERROR");
            throw error;
        }
    });
        }

    }
});

    
}





//===============================     TXT FILE        =========================================
function doTxt() {
    fs.readFile("random.txt", "utf8", function(error, data) {

       
        if (error) {
          return console.log(error);
        }
      
        var dataArr = data.split(",");
        
        if(dataArr[0] === "spotify-this-song"){
            command = dataArr[0];
            song = dataArr[1].replace(/["]+/g, '');
            getSong(song);
            
        } 
 
    });
    
    
}



//====   case switch statement for handling inputs (command), 4 cases and a default     ======

switch(command) {
    case "my-tweets":
    getTweets();
        break;
    case "spotify-this-song":
    getSong();
        break;
    case "movie-this":
    getMovie();
        break;
    case "do-what-it-says":
    doTxt();
        break;
    default:
    console.log(`To see what LIRI can do, try using one of her commands:
        -'node liri my-teets': this will pull up my last 20 tweets as the Nodest
        -'node liri spotify-this-song <song name>': this will pull info from spotify
        -'node liri movie-this <movie name>': learn all about a movie with the power of OMDB
        -'node liri  do-what-it-says':learn secrets from a hidden file `) //list accepted commands
    
}

