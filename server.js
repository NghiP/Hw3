var express = require('express');
var app = express();
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //global hack
var bcrypt = require('bcrypt');

var jwt = require('jsonwebtoken');

var Movie=require('./Movie');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));

app.use(passport.initialize());

var router = express.Router();

router.route('/post')
    .post(authController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );



router.post('/signup', function(req, res) {
    db.findUser(req.body.username, function(user)
    {
        if (user)
        {
            res.status(401).send({success: false, msg: 'Username already exists.'});
        }
        else
        {
            if (!req.body.username || !req.body.password) {
                res.json({success: false, msg: 'Please pass username and password.'});
            } else {
                var newUser = {
                    username: req.body.username,
                    password: req.body.password
                };
                // save the user
                db.save(newUser); //no duplicate checking
                res.json({success: true, msg: 'Successful created new user.'});
            }
        }
    });
});
router.post('/signin', function (req, res) {

    db.findUser(req.body.username, function(user)
    {
        if (!user) {
            res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
        }
        else {
            // check if password matches
            bcrypt.compare(req.body.password, user.password, function (err, result) {
                if (result) {
                    var userToken = {id: user.id, username: user.username};
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);
                    res.json({success: true, token: 'JWT ' + token});
                }
                else {
                    res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
});


router.get('/getOneMovie/:title', function(req, res)
{
    db.findOneMovie(req.params.title, function(movies) {
        console.log(movies);
        res.json(movies);
    });
});

/*router.post('/saveMovie', function(req, res) {
    db.saveMovie(req.body, function (err) {
        if (err) res.json({msg: "Error trying to save movie", "Error message": err.errmsg});
        else res.json({msg: "Movie Saved."});
    });
});
*/
router.delete('/deleteMovie/:title', function (req, res) {
    db.deleteOneMovie(req.params.title, function (movies) {
        console.log(movies);
        res.json(movies);

    });
});
router.get('/movies', function (req, res) {
        db.findAllMovies(function (movies) {
            res.json(movies);
        });
    });
router.route('/saveMovies')

    .post((function (req, res) {
        if (!req.body.title || !req.body.YearReleased|| !req.body.genre || !req.body.actors && req.body.actors.length) {
            res.json({success: false, msg: 'Please pass movie information (title,genre,year,and three actors(actorname, ' +
                'charactername))'});
        }
        else {
            if(req.body.actors.length < 3) {
                res.json({ success: false, message: 'Please include at least three actors from the film'});
            }
            else {
                var newMovie = new Movie (req.body, res);
                newMovie.title = req.body.title;
                newMovie.YearReleased = req.body.YearReleased;
                newMovie.genre = req.body.genre;
                newMovie.actors = req.body.actors;

                newMovie.save(function(err) {
                    if (err) {
                        // duplicate entry
                        if (err.code == 11000)
                            return res.json({ success: false, message: 'A movie with that title already exists'});
                        else
                            return res.send(err);
                    }

                    res.json({ message: 'Movie created!' });
                });
            }
        }
    }));

router.route('/update/:title')
    .put(function(req, res) {
        Movie.findOne({title:req.params.title}, function(err, results) {
            if (results !== null) {
                Movie.update({title:req.params.title}, req.body).exec(function (err) {
                    res.json({message: "Successfully edited the movie."});
                });
            }
            else {
                res.json({message: "Could not find a movie with that title. Edit failed."});
            }
        });
    });





app.use('/', router);
app.listen(process.env.PORT || 8080);
console.log("listening on port " + (process.env.PORT || 8080));
