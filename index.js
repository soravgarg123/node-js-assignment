/*
 * Purpose: Running node.js and initialize. 
 * Author : Sorav Garg (soravgarg123@gmail.com)
*/
const app                = require('express')(),
	  express            = require('express'),
	  server             = require('http').Server(app),
	  bodyParser         = require('body-parser'),
	  dateTime           = require('date-time'),
	  session            = require('express-session');


/* Require Enviornment File  */
require('dotenv').config();

/* To set view engine */
app.set('view engine', 'ejs');

/* To set port */
app.set('port', process.env.PORT);

/* To handle invalid JSON data request */
app.use(bodyParser.json());

/* For parsing urlencoded data */
app.use(bodyParser.urlencoded({limit: '10mb', extended: true }));

/* To Listen Port */
server.listen(app.get('port'), function () {
  console.log(`Express server listening on port ${app.get('port')}`);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/* Initialize express-session */
app.use(session({
    key: 'UserID',
    secret: 'MY_SECRET_KEY',
    resave: false,
    saveUninitialized: false
}));

/* Middleware function to check for logged-in users */
var sessionChecker = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/welcome');
    }else {
        next();
    }    
};

app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
});

app.get('/', sessionChecker,function(req, res) {
	res.render('pages/index')
});

/* Require modules */
require('./modules/signup.js')(app,sessionChecker);
require('./modules/login.js')(app,sessionChecker);

module.exports = { app };

/* End of file index.js */
/* Location: ./index.js */