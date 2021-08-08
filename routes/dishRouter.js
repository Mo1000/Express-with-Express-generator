const express = require('express');
const bodyParser = require('body-parser');
const authenticate= require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());




/***/
dishRouter.route('/')
    .get((req,res,next) => {
        Dishes.find({})
            .populate('comments.author')/**Dans le models de dishes nous avons dis au niveau des
         commentaire pour les auteurs il referencera les utilisateur
         .populate('comments.author') nous permet de garantie que le champ requis sera remplis*/
            .then((dishes) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    /**authenticate.verifyUser pour obliger l'utilisateur a s'authentifier avant ces actions
     * authenticate.verifyUser il faut que celui si reussise avant quil ne passe a celui ci
     (req, res, next) = >  si non il genere une erreur */
    .post(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
        /**Dans req body il ya le corps du message */
        Dishes.create(req.body)
            .then((dish) => {
                console.log('Dish Created ', dish);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
        Dishes.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });
/**Router par rapport a un plat specifique */
dishRouter.route('/:dishId')
    .get((req,res,next) => {
        /**req.params.dishId est l"id du plat*/
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/'+ req.params.dishId);
    })
    .put(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
        /**{ new: true } pour que la methode findByIdAndUpdate retourne le plat sous
         forme de reponse json*/
        Dishes.findByIdAndUpdate(req.params.dishId, {
            $set: req.body
        }, { new: true })
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
        Dishes.findByIdAndRemove(req.params.dishId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

/***/
/**Commentaire d'un plat specifque*/
dishRouter.route('/:dishId/comments')
    .get((req,res,next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments);
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(authenticate.verifyUser,(req, res, next) => {
        /**Dans req body il ya le corps du message
         * authenticate.verifyUser  charge les info de l'utilsateur dans
         * req.user
         * req.user._id; pour l'id*/
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    req.body.author=req.user._id;/**Le champs comments.author se remplis autamatique
                     quand utilisateur se connecte avec son id  vu qu'on la deja authentifier
                     au niveau de authenticate.verifyUser */
                    dish.comments.push(req.body);
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)/**Chercher le plat pour remplir la partir
                             comments.author avec mongoose population */
                                .populate('comments.author')
                                .then((dish)=>{
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })
                        }, (err) => next(err));
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(authenticate.verifyUser,(req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes/'
            + req.params.dishId + '/comments');
    })
    .delete(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    for (var i = (dish.comments.length -1); i >= 0; i--) {
                        dish.comments.id(dish.comments[i]._id).remove();
                    }
                    dish.save()
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);
                        }, (err) => next(err));
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });
/**Router par rapport a un Commentaire specifique d'un plat specifque*/
dishRouter.route('/:dishId/comments/:commentId')

    .get((req,res,next) => {
        /**req.params.dishId est l"id du plat*/
            Dishes.findById(req.params.dishId)
                .populate('comments.author')
                .then((dish) => {
                    if (dish != null && dish.comments.id(req.params.commentId) != null) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish.comments.id(req.params.commentId));
                    }
                    else if (dish == null) {
                        err = new Error('Dish ' + req.params.dishId + ' not found');
                        err.status = 404;
                        return next(err);
                    }
                    else {
                        err = new Error('Comment ' + req.params.commentId + ' not found');
                        err.status = 404;
                        return next(err);
                    }
                }, (err) => next(err))
                .catch((err) => next(err));
        })
            .post(authenticate.verifyUser,(req, res, next) => {
                res.statusCode = 403;
                res.end('POST operation not supported on /dishes/'+ req.params.dishId
                    + '/comments/' + req.params.commentId);
            })
    .put(authenticate.verifyUser,(req, res, next) => {
        /**{ new: true } pour que la methode findByIdAndUpdate retourne le plat sous
         forme de reponse json*/
        Dishes.findById(req.params.dishId)
            /**
             * comment authors etant de   type: mongoose.Schema.Types.ObjectId on peux utiliser populate pour recuperer
             les donnes voir https://mongoosejs.com/docs/populate.html
             */
        .populate('comments.author')
            .then((dish) => {
                console.log("USEr",req.user._id);
                console.log("Popu",dish.comments.id(req.params.commentId).author._id);// recuperation de L'id grace a populate
                console.log("Popu",dish.comments.id(req.params.commentId).author.username);// recuperation du username
                if (dish != null && dish.comments.id(req.params.commentId) != null &&
                    dish.comments.id(req.params.commentId).author._id.equals(req.user._id) ) {
                    if (req.body.rating) {
                        dish.comments.id(req.params.commentId).rating = req.body.rating;
                    }
                    if (req.body.comment) {
                        dish.comments.id(req.params.commentId).comment = req.body.comment;
                    }
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish)=>{
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })
                        }, (err) => next(err));
                }
                else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else if(  ! req.user._id.equals(dish.comments.id(req.params.commentId).author._id))
                {

                err = new Error('You are not authorized to update this comment!');
                    err.status = 403;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(authenticate.verifyUser,(req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                console.log("USEr",req.user._id);
                console.log("Popo",dish.comments.id(req.params.commentId).author);
                if (dish != null && dish.comments.id(req.params.commentId) != null && 
                req.user._id.equals(dish.comments.id(req.params.commentId).author)) {
                    dish.comments.id(req.params.commentId).remove();
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish)=>{
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })
                        }, (err) => next(err));
                }
                else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else if( ! req.user._id.equals(dish.comments.id(req.params.commentId).author) )
                {
                err = new Error('You are not authorized to delete this comment!');
                    err.status = 403;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = dishRouter;