var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/**Le passport ajoute automatiquement le nom et le mdp et le mdp est
 * crypté avec un hachage */
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname:{
        type:String,
        default:''
    },
    lastname:{
        type:String,
        default:''
    },
    facebookId:String,
    admin:   {
        type: Boolean,
        default: false
    }
});
/**Pour utilser le plugin passport */
User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);