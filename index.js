var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use('/static', express.static('public'));

var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: 'z8dm3VDye9T3OF8tuQwd116Jm',
    consumer_secret: 'M8apqoHRkb2uvrr6NoFRsqP1W85vJxh3Itk9Uf9V50BUQEWUiS',
    access_token_key: '14132114-ahifo1LnjRBQjLTG1Xmm0aAYge8aLH9oz3Yn8lqnk',
    access_token_secret: 'ipje5adF4OqV4MI9kZ9zMJYiU3mdA6awg1FH3pX383Fxx'
});

var makeTweetUseful = function (status) {
    var data = {
        user: status.user.screen_name,
        image: status.entities.media[0].media_url,
        link: 'https://www.twitter.com/' + status.user.screen_name + '/status/' + status.id_str
    };
    return data;
};

var fixTweets = function (tweets) {
    return tweets.statuses.map(makeTweetUseful);
};

var cachedTweets;
var getTweets = function () {
    console.log('getting tweets');
    var phrase = "you're probably wondering how i ended up in this situation";
    client.get('search/tweets', {
        q: phrase,
        filter: 'twimg',
        exclude: 'retweets'
    }, function (error, tweets, response) {
        cachedTweets = fixTweets(tweets);
    });
};

// populate
getTweets();

var interval = 60 * 1000 * 1; // 1 min
setInterval(getTweets, interval)

app.get('/', function(req, res) {
    res.render('app', {
        tweets: cachedTweets || []
    });
});

app.listen(8080);
console.log('8080 is the magic port');
