var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport =require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter=require('./routes/dishRouter');
var promoRouter=require('./routes/promotionRouter');
var leaderRouter=require('./routes/leaderRouter');

const mongoose = require('mongoose');



/**Connection a la base de donnée */
const url= config.mongoUrl;
const  connect= mongoose.connect(url);

connect
    .then((db)=>{
      console.log('connected correctly to server ');
    },
        (err) =>{
      console.log(err);
        });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
/**app.use(cookieParser('12345-67890-09876-54321'));
/**Code secret pour reconnaitre les cookies*/

/**La session prends des données  plus volumineux que les cookies et elle prends en compte
 les cookies
/*app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()//
    /**mettre  la session de chaque utilsateur dans un magasin
     de fichier
}));*/


/** donner l'acces a l'application node
 * node lit middleware par middleware si ce middleware n'est pas valide
 il pourra pas passer au suivant donc il faut bien respecter l'autre des middleware  */

app.use(passport.initialize());
//app.use(passport.session());/**pour utiliser le passport*/
/***********************/
/**Car on fait l'authentifiaction avant de passer au reste*/
app.use('/', indexRouter);
app.use('/users', usersRouter);
/**Un utilsateur quelconque peut acceder a l'index et a la page d'autentification mais
 * pour avancer il doit s'authentifier */

/*******************/
/**function auth (req, res, next) {
//console.log(req.signedCookies.user);
    //console.log(req.session);
    /**Utilisation des cookies signées *

    if(!req.user/**!req.session.user*) {
        var err = new Error('You are not authenticated!');
        err.status = 403;
        return next(err);
    }
    else {
        next();//a cause du passport qui prends en charge la session avec la serialisation
        /** 'authenticated' est la reponse dans req.session.user dans users.js
         * si l'authentification a reussi  *
       /* if (req.session.user === 'authenticated') {

        }
        else {
            var err = new Error('You are not authenticated!');
            err.status = 403;
            return next(err);
        }*
    }
}

app.use(auth);*/
app.use(express.static(path.join(__dirname, 'public')));

/**Apres s'est authentifiés il peut avoir acces a ces routes*/
app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
