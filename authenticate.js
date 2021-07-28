var passport = require('passport');// import du passport
var LocalStrategy = require('passport-local').Strategy;/**Pour la strategie
 a utiliser avec le passport */
var User = require('./models/user');// Le schema user de mongoDB

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