const  express = require('express');
const bodyParser = require('body-parser');
const authenticate =require('../authenticate');
const cors = require("./cors");
const leaderRouter=express.Router()
const Leaders = require('../models/leader');


leaderRouter.use(bodyParser.json());
leaderRouter.route('/')

    /**Pour etablir un point de terminaison all veut dire (post,put get ,delete,****)
     le chemin sera le meme que pour les autres et avec le next on transmet les memes
     parametre au autres aussi
     API REST(Representational State Transfert)*/
   /* .all((req,res,next) =>{
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
        Leaders.find(req.query)
            .then((leaders) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leaders);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
        Leaders.create(req.body)
            .then((leader) => {
                console.log('Leader Created ', leader);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
        res.statusCode =403;
        res.end('Put operation no supported on / leaders');
    })

    .delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
        Leaders.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

leaderRouter.route('/:leaderId')

    .options(cors.corsWithOptions,(req,res)=>{
        res.sendStatus(200)
    })
    /**Concernant un leader specifique*/
    .get(cors.cors,(req,res,next) =>{
        Leaders.findById(req.params.leaderId)
            .then((leader) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
        res.statusCode =403;
        res.end('Post operation no supported on /leader/' +
            req.params.leaderId);
    })

    .put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
        /**{ new: true } pour que la methode findByIdAndUpdate retourne le leader sous
         forme de reponse json*/
        Leaders.findByIdAndUpdate(req.params.leaderId, {
            $set: req.body
        }, { new: true })
            .then((leader) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
        Leaders.findByIdAndRemove(req.params.leaderId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = leaderRouter;