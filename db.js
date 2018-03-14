var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var mongoDB= 'mongodb://NghiPhan2:12345@ds149433.mlab.com:49433/homework3';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
Schema= mongoose.Schema;
Users= mongoose.Schema;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var MovieSchema = new Schema
({
    title:
        {
            type: String,
            unique:true,
            require: true
        },
    yearRelease:
        {
            type: String,
            require:true

        },
    genre:
        {
            type: String,
            require:true,
            enum: ["Action", "Adventure", "Comedy", "Romance", "Horror", "Fantasy"]
        }
    ,
    actors: {
        type: Array
    }

});
var userSchema = new Schema({

    name: String,
    username: {
        type: String,
        required: true,
        unique: true    //ensures no dupes
    },
    password: {
        type: String,
        required: true
    }
});

var User = mongoose.model('user', userSchema);
var Movie= mongoose.model('movie',MovieSchema);

var crypto = require('crypto');
module.exports = function () {
    return {
        userList: [],
        /*
         * Save the user inside the "db".
         */
        save: function (user) {
            bcrypt.hash(user.password, 10, function(err, hash) {
               var newUser = new User({
                   username: user.username,
                   password: hash
               });
               newUser.save(function(err) {
                   if (err) throw err;
               });
            });
        },
        /*
         * Retrieve a movie with a given id or return all the movies if the id is undefined.
         */
        find: function (id) {
            if (id) {
                return this.userList.find(function (element) {
                    return element.id === id;
                });
            }
            else {
                return this.userList;
            }
        },
        findOneMovie: function (movieTitle, callback)
        {
            Movie.findOne({movieName:movieTitle}).exec(function(err, results) {
                if (err) return err;
                console.log(results);
                callback(results);
            });
        },

        saveMovie: function (req){
            {
                var movie = new Movie(req.body);
                movie.title = req.body.title;
                movie.YearReleased = req.body.YearReleased;
                movie.genre = req.body.genre;
                movie.actors = req.body.actors;

                movie.save(function(err){
                        if (err) {
                            // duplicate entry
                            if (err.code == 11000)
                                return res.json({ success: false, message: 'A movie with that title already exists'});
                            else
                                return res.send(err);
                        }
                                        })
            }
            },
        findUser:function(findUsername,callback)
        {
            User.findOne({username:findUsername}).exec(function(err,result){
              if (err)callback ({message:"could not find"});
              callback(result);

            });
        },

        findAllMovies: function(callback) {
            Movie.find().exec(function (err, Movies) {
                if (Movies === null) callback({msg: "Could not find movies"});
                else callback(Movies);
            });
        },
        deleteOneMovie: function(movieTitle, callback) {
            Movie.findOne({movieName: movieTitle}).exec(function (err, results) {
                if (results !== null) {
                    Movie.remove({movieName: movieTitle}).exec(function (err) {
                        callback({message: "Movie deleted."});
                    });
                }
                else {
                    callback({message: "Could not find a movie with that title. Delete failed."});
                }
            });
        },

        findOne: function (name) {
            if (name) {
                return this.userList.find(function (element) {
                    return element.username === name;
                });
            }
            else {
                return this.userList;
            }
        },
        /*
         * Delete a movie with the given id.
         */
        remove: function (id) {
            var found = 0;
            this.userList = this.userList.filter(function (element) {
                if (element.id === id) {
                    found = 1;
                }
                else {
                    return element.id !== id;
                }
            });
            return found;
        },
        /*
         * Update a movie with the given id
         */
        update: function (id, user) {
            var userIndex = this.userList.findIndex(function (element) {
                return element.id === id;
            });
            if (userIndex !== -1) {
                this.userList[userIndex].username = user.username;
                this.userList[userIndex].password = user.password;
                return 1;
            }
            else {
                return 0;
            }
        },





    };
};