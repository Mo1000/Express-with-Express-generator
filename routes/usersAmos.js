var express = require('express');
const bodyParser = require('body-parser');
var  User = require('../models/user');
var passport =require('passport');
var  authenticate =require('../authenticate');
const  cors= require('./cors');


var router = express.Router();
router.use(bodyParser.json());

router.options('*', cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
 /*GET users listing. */
/**vu qu'on a utilser router.get directement ce qui est different de ce qui est utilser
 * pour les autres routes plus besoin d'ecrire  ca

.options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200)
    on met juste cors.corsWithOptions dans le get en premier pour exiger de verifier
    l'origine de la ressorce avant de continuer
})*/
router.get('/',cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,function(req, res, next) {
/**Seul l'ADMIN peut voir les utilisateurs**/

        User.find({})
            .then((users)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(users);
            },(err)=>next(err))
            .catch((err)=>{
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err:err});
            });

});

router.post('/signup', cors.corsWithOptions,(req, res, next) => {
    /**le Passport locol mongoose nous fournit de nouvelle methode pour
     * l'authentification*/
    /**register prend en parametre en 1er un nouvelle utillsateur ,le mdp,et la fonction de
     rappelle */
    User.register(new User({username: req.body.username}),req.body.password,
        (err,user) => {
            if(err != null) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err:err});
            }
            else {
                if(req.body.firstname)
                    user.firstname=req.body.firstname;
                if(req.body.lastname)
                    user.lastname=req.body.lastname;
                user.save((err,user)=>{
                    if(err){
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({err:err});
                        return;
                    }

                    /**SI il n'y a pas d'erreur utils?? la strategie du passport  */
                    passport.authenticate('local')(req,res,()=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({success:true ,status: 'Registration Successful!'});
                });
           });
            }
        });
});




router.post('/login',cors.corsWithOptions, (req, res, next) => {

    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);

        if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, status: 'Login Unsuccessful!', err: info});
        }

        req.logIn(user, (err) => {
            if (err) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
            }

            var token = authenticate.getToken({_id: req.user._id});

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'Login Successful!', token: token});
        });
    })(req, res, next)
});

router.get('/logout', (req, res,next) => {
    if (req.session) {
        req.session.destroy();/**Pour detruire la session du client c'est information
         et les cookies niveau serveur mais pas niveau client  */
        res.clearCookie('session-id');// supprim?? les cookies niveau client
        res.redirect('/');
    }
    else {
        var err = new Error('You are not logged in!');
        err.status = 403;
        next(err);
    }
});
/**POint de terminaison pour la connexion avec un compte fb*/
router.get('/facebook/token', passport.authenticate('facebook-token'),
    (req, res) => {
    if (req.user) {
        var token = authenticate.getToken({_id: req.user._id});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, token: token, status: 'You are successfully logged in!'});
    }
});

router.get('/checkJWTtoken', cors.corsWithOptions, (req, res) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if (err)
            return next(err);

        if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            return res.json({status: 'JWT invalid!', success: false, err: info});
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({status: 'JWT valid!', success: true, user: user});

        }
    }) (req, res);
});

/**router.post('/login',cors.corsWithOptions,
 (req, res,next) => {
    /**Utilisation des cookies sign??es authentification express session  /
    //si l'utilisateur n'est pas encore authentifier ou connect??
   /* if(!req.session.user) {
        var authHeader = req.headers.authorization;

        if (!authHeader) {
            var err = new Error('You are not authenticated!');
            //authHeader contient la req du client soit le nom d'utilisateur et le mdp cod?? en base 64
            //envoyer en reponse que c'est une Authentication*
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }*/

//var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
/**Buffer un tampon qui divise la valeur en suivant l'encodage qu'on donne
 * split pour diviser et l'espace dans le split comme parti de separation
 *le premier element de cette separation est l'element cod?? en base 64
 * l'autre ou l'element existe
 * toString() contiendra le nom d'utilsateur et le mdp  separer par : au cause de split(':')
 * auth est un tableau dont le premier element est le non d'utilsateur
 * et le second le password /
 /*   var username = auth[0];
 var password = auth[1];

 User.findOne({username: username})
 .then((user) => {
                if (user === null) {
                    var err = new Error('User ' + username + ' does not exist!');
                    err.status = 403;
                    return next(err);
                }
                else if (user.password !== password) {
                    var err = new Error('Your password is incorrect!');
                    err.status = 403;
                    return next(err);
                }
                else if (user.username === username && user.password === password) {
                    req.session.user = 'authenticated';
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You are authenticated!')
                }
            })
 .catch((err) => next(err));
 }
 //Donc il est connect??
 else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are already authenticated!');
    }/


 /**Utilsation du passport
 si l'authentification ne reussi pas alors passport.authenticate('local') mis en parametre
 nous signale l'erreur  /

 passport.authenticate('local', (err, user, info) => {
            if (err)
                return next(err);
            /**Si l'utilsateur n'existe pas ou Si le username ou le mdp sont incorrect/
            if (!user) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: false, status: 'Login Unsuccessful!', err: info});
            }
            /**le user n'est pas null donc le passport la trouver et il est connecter/
            req.logIn(user, (err) => {
                if (err) {
                    res.statusCode = 401;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
                }

                /**Creer un jeton =token a inclus dans l'en tete d'autorisation avec l'id
 * du user/
                var token = authenticate.getToken({_id: req.user._id});
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: true, status: 'Login Successful!', token: token});
            });
        }) (req, res, next);

 });*/
module.exports = router;
