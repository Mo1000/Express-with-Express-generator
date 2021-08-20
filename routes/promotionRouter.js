const  express = require('express');
const bodyParser = require('body-parser');
const authenticate =require('../authenticate');
const cors = require("./cors");
const promotionRouter=express.Router();
const Promotions = require('../models/promotion')


promotionRouter.use(bodyParser.json());
promotionRouter.route('/')

    /**Pour etablir un point de terminaison all veut dire (post,put get ,delete,****)
     le chemin sera le meme que pour les autres et avec le next on transmet les memes
     parametre au autres aussi
     API REST(Representational State Transfert)*/
  /*  .all((req,res,next) =>{
        res.statusCode =200;
        res.setHeader('Content-Type','text/plain');
        next();
    })*/
    /**.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
     * Pour deja introduire le Cross Origin Ressource sharing (cors) et
     definir quel address peut avoir acces a cette methode voir whiteListe
     dans cors.js
     */
    .options(cors.corsWithOptions,(req,res)=>{
        res.sendStatus(200)
    })
    .get(cors.cors,(req,res,next) =>{
        Promotions.find(req.query)
            .then((promo) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promo);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
        Promotions.create(req.body)
            .then((promo) => {
                console.log('Promotion Created ', promo);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promo);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
        res.statusCode =403;
        res.end('Put operation not supported on / promotions ');
    })

    .delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
        Promotions.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

promotionRouter.route('/:promotionId')

    .options(cors.corsWithOptions,(req,res)=>{
        res.sendStatus(200)
    })
    /**Concernant une promotion specifique*/
    .get(cors.cors,(req,res,next) =>{
        Promotions.findById(req.params.promotionId)
            .then((promo) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promo);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
        res.statusCode =403;
        res.end('Post operation no supported on /promotion/' +
            req.params.promotionId);
    })

    .put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
        /**{ new: true } pour que la methode findByIdAndUpdate retourne la promotions sous
         forme de reponse json*/
        Promotions.findByIdAndUpdate(req.params.promotionId, {
            $set: req.body
        }, { new: true })
            .then((promo) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promo);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
        Promotions.findByIdAndRemove(req.params.promotionId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = promotionRouter;