var passport = require('passport');// import du passport
var LocalStrategy = require('passport-local').Strategy;/**Pour la strategie
 a utiliser avec le passport */
var User = require('./models/user');// Le schema user de mongoDB
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt= require('passport-jwt').ExtractJwt;
var jwt= require('jsonwebtoken');


var config=require('./config');

exports.local =passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/**Si on utilise pas Passport-local-mongose on dois utiliser notre propre
 fonction d'authentification
 Passport-local-mongose definis dans le model USer nous permet
 de mettre dans le passport l'authentifiaction la serialisation
 et la deserialisation
 la serialisation et la deserialisation permettent de stocker
 coté serveur et de rendre les informations d'un user pour sa session*/

/**Fournit un jeton a un user expiresIn le temps de validité 1h
 * config.secretKey defini dans config.js */

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};
/**Strategie basée sur le Json web token jwt*/
var opts={};
opts.jwtFromRequest =ExtractJwt.fromAuthHeaderAsBearerToken();/**Extrait le jeton de
 l'en tete authentification*/
opts.secretOrKey=config.secretKey;
/**la JwtStrategyprends trois parametre options et une fonction avec la charge utile
 * et le fait
 * la charge utilse ou payload contient id */
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

/**Verifier l'utilsateur avec la staregie JWT pas local*/
exports.verifyUser = passport.authenticate('jwt', {session: false});