/*
 * Purpose : For Sign Up module
 * Developed By  : Sorav Garg (soravgarg123@gmail.com)
*/

module.exports = function(app,sessionChecker) {

const { check, matches,validationResult, matchedData } = require('express-validator'),
	  MongoClient = require('mongodb').MongoClient,
	  dateTime = require('date-time'),
	  md5 = require('md5'),
	  crypto = require('crypto');

/* Require Enviornment File  */
require('dotenv').config();

/* Signup template */
app.get('/signup', sessionChecker, function(req, res) {
	res.render('pages/signup',{
		data: {},
		errors: {},
    	success: {}
	})
});


/* To user signup
 * @param {string}  Name
 * @param {string}  EmailID
 * @param {string}  Phone
 * @param {string}  Password
*/
app.post('/signup', [
		check('Name')
			.notEmpty()
			.withMessage('Name is required')
    		.trim(),
    	check('EmailID')
			.notEmpty()
			.withMessage('Email Address is required')
    		.trim(),
    	check('EmailID')
			.isEmail()
			.withMessage('That enter valid Email Address'),
		check('Phone')
			.notEmpty()
			.withMessage('Phone is required')
    		.trim(),
    	check('Password')
			.notEmpty()
			.withMessage('Password is required')
    		.trim(),
    	check('Password')
		    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/, "i")
		    .withMessage('Password field must contain at least 6 characters, including UPPER/lower case & numbers & at-least a special character'),
	], function(req, res) {
	  let errors = validationResult(req);
	  if (!errors.isEmpty()) {
	    res.render('pages/signup', {
		    data: req.body,
		    errors: errors.mapped(),
		    success: {}
		});
	  }

	  	let data = matchedData(req);
	    MongoClient.connect('mongodb://'+process.env.DB_HOST+':'+process.env.DB_PORT, function(err, db) {
		  if (err) throw err;
		  var mongodb = db.db(process.env.DB_NAME);
		  data.CreatedAt = dateTime({ local: false, date: new Date() })
		  data.Password  = crypto.createHash('md5').update(data.Password).digest("hex");
		  mongodb.collection("users").insertOne(data, function(err, dbResp) {
		    if (err) throw err;
		    db.close();
		    if(!dbResp.insertedId){
		    	res.render('pages/signup', {
				    data: data,
				    errors: {'message' : 'Failed, please try agian after some time'},
				    success: {}
				});
		    }else{
		    	res.render('pages/login', {
				    data: {},
				    errors: {},
				    success: {'message' : 'User registered successfully'}
				});
		    }
		  });
		});
});

}