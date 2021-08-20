var passport = require('passport');// import du passport
var LocalStrategy = require('passport-local').Strategy;/**Pour la strategie
 a utiliser avec le passport */
var User = require('./models/user');// Le schema user de mongoDB
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config.js');


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
        {expiresIn: 10800});
};
/**Strategie basée sur le Json web token jwt*/
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();/**Extrait le jeton de
 l'en tete authentification*/
opts.secretOrKey = config.secretKey;
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

exports.verifyAdmin=(req,res,next)=> {
    if (req.user.admin === true) {
        return next();
    } else {
        err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};

/***Passport facebook*/
exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, /**Call back fonction*/ (accessToken, refreshToken, profile, done) => {
        User.findOne({facebookId: profile.id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (!err && user !== null) {
                return done(null, user);
            }
            else {
                /**Le nom sera obtenu de Facebook  pour les donnes on utilise profile*/
                user = new User({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err)
                        return done(err, false);
                    else
                        return done(null, user);
                })
            }
        });
    }
    ));
