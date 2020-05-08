/*
 * Purpose : For Login module
 * Developed By  : Sorav Garg (soravgarg123@gmail.com)
*/

module.exports = function(app,sessionChecker) {

const { check, matches,validationResult, matchedData } = require('express-validator'),
	  MongoClient = require('mongodb').MongoClient,
	  dateTime = require('date-time'),
	  md5 = require('md5'),
	  crypto = require('crypto');

/* Login template */
app.get('/login', sessionChecker,function(req, res) {
	res.render('pages/login',{
		data: {},
		errors: {},
    	success: {}
	})
});

/* To user login
 * @param {string}  EmailID
 * @param {string}  Password
*/
app.post('/login', [
    	check('EmailID')
			.notEmpty()
			.withMessage('Email Address is required')
    		.trim(),
    	check('EmailID')
			.isEmail()
			.withMessage('That enter valid Email Address'),
    	check('Password')
			.notEmpty()
			.withMessage('Password is required')
    		.trim(),
	], function(req, res) {
	  let errors = validationResult(req);
	  if (!errors.isEmpty()) {
	    res.render('pages/login', {
		    data: req.body,
		    errors: errors.mapped(),
		    success: {}
		});
	  }

	  	let data = matchedData(req);
	    MongoClient.connect('mongodb://'+process.env.DB_HOST+':'+process.env.DB_PORT, function(err, db) {
		  if (err) throw err;
		  var mongodb = db.db(process.env.DB_NAME);
		  data.Password  = crypto.createHash('md5').update(data.Password).digest("hex");
		  mongodb.collection("users").findOne(data, function(err, dbResp) {
		    if (err) throw err;
		    db.close();
		    if(!dbResp){
		    	res.render('pages/login', {
				    data: data,
				    errors: {'message' : 'Invalid Email address Or Password'},
				    success: {}
				});
		    }else{
		    	req.session.user = dbResp;
		    	res.render('pages/welcome', {
				    data: dbResp,
				    errors: {},
				    success: {'message' : 'User logged in successfully'}
				});
		    }
		  });
		});
});

/* Welcome template */
app.get('/welcome' , function(req, res) {
	 if (req.session.user) {
        res.render('pages/welcome', {
		    data: req.session.user,
		    errors: {},
		    success: {}
		});
    } else {
        res.redirect('/login');
    }
});

/* Logout */
app.get('/logout', function(req, res) {
	if (req.session.user) {
        res.clearCookie('UserID');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

}