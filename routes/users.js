var express = require('express');
const bodyParser = require('body-parser');
var  User = require('../models/user');
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
    User.findOne({username: req.body.username})
        .then((user) => {
            if(user != null) {
                var err = new Error('User ' + req.body.username + ' already exists!');
                err.status = 403;
                next(err);
            }
            else {
                return User.create({
                    username: req.body.username,
                    password: req.body.password});
            }
        })
        .then((user) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({status: 'Registration Successful!', user: user});
        }, (err) => next(err))
        .catch((err) => next(err));
});


router.post('/login', (req, res, next) => {
    /**Utilisation des cookies signées */
    //si l'utilisateur n'est pas encore authentifier ou connecté
    if(!req.session.user) {
        var authHeader = req.headers.authorization;

        if (!authHeader) {
            var err = new Error('You are not authenticated!');
            /**authHeader contient la req du client soit le nom d'utilisateur et le mdp
             codé en base 64 */
            /**envoyer en reponse que c'est une Authentication*/
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }

        var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        /**Buffer un tampon qui divise la valeur en suivant l'encodage qu'on donne
         * split pour diviser et l'espace dans le split comme parti de separation
         *le premier element de cette separation est l'element codé en base 64
         * l'autre ou l'element existe
         * toString() contiendra le nom d'utilsateur et le mdp  separer par : au cause de split(':')
         * auth est un tableau dont le premier element est le non d'utilsateur
         * et le second le password */
        var username = auth[0];
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
    //Donc il est connecté
    else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are already authenticated!');
    }
});

router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy();/**Pour detruire la session du client c'est information
         et les cookies niveau serveur mais pas niveau client  */
        res.clearCookie('session-id');// supprimé les cookies niveau client
        res.redirect('/');
    }
    else {
        var err = new Error('You are not logged in!');
        err.status = 403;
        next(err);
    }
});

module.exports = router;
