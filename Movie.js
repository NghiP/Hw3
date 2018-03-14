var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var mongoDB= 'mongodb://NghiPhan2:12345@ds149433.mlab.com:49433/homework3';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
Schema= mongoose.Schema;
Users= mongoose.Schema;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


var MovieSchema=new Schema
({
    title:
        {
            type: String,
            require: true,
            unique: true
        },
    yearRelease:
        {
            type:String,
            require:true
        },
    genre:
        {
            type:String,
            require:true,
            enum:["Action","Adventure", "Comedy","Romance","Horror","Fantasy"]

        }
    ,
    actors: {
        type: Array
    }

});
module.exports = mongoose.model('Movie',MovieSchema);