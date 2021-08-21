const  express= require('express');
const  bodyParser = require('body-parser');
const  authenticate = require('../authenticate');
const cors= require('./cors');
const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());



/**Point de Terminaison*/


favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
        Favorites.find({user:req.user._id})
            .populate('user')
            .populate('dishes')
            .then((favoriteuser)=>{
                    if (favoriteuser!=null ){
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favoriteuser);
                    }
                    else {
                        err = new Error('Favorites Dishe of user ' + favoriteuser.user.username +
                        'not found');
                        err.status = 404;
                        return next(err);
                    }
            },(err)=>next(err))
            .catch((err)=> next(err));
})

    .post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{

        Favorites.findOne({user:req.user._id})
           .populate('dishes')
            .then((favorite)=>{
                if (favorite!=null){
               /**Verifier si il existe ce plat dans le favoritesplate de l'utilisateur /
                    for(let element of favorite.dishes){
                        if (req.body) {
                            for (let element1 of req.body) {
                                if (element.equals(element1)) {
                                    var err = new Error("This Dish is already in your favorites plate");
                                    err.status = 403;
                                    return next(err);
                                } else {
                                    favorite.dishes.push(element1);
                                }

                            }
                        }
                    }*/
               /**if (req.body!=null) {
                   for (let element of req.body) {
                       for (let  element1 of favorite.dishes) {
                           if (element1.equals(element._id)){
                               var err = new Error("This Dish is already in your favorites plate");
                               err.status = 403;
                               return next(err);
                           }
                           else {
                               favorite.dishes.push(element);
                           }
                       }
                   }
               }*/

                    if (req.body!=null) {
                        for (let element of req.body) {
                            favorite.dishes.push(element);
                        }
                        favorite.save()
                            .then((favorite)=>{
                                Favorites.findById(favorite._id)
                                    .populate('user')
                                    .populate('dishes')
                                    .then((favorite)=>{
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    },(err)=>next(err));
                            },(err)=>next(err))
                            .catch((err)=>next(err));
                    }


                }
                else {
                    var Favorite= new Favorites();
                    Favorite.user= req.user._id;
                    //Favorite.push(req.body);
                    if (req.body!=null) {
                        for (let element of req.body) {
                            Favorite.dishes.push(element);
                        }
                        Favorite.save()
                            .then((favorite)=>{
                                Favorites.findById(favorite._id)
                                    .populate('user')
                                    .populate('dishes')
                                    .then((favorite)=>{
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    },(err)=>next(err));
                            },(err)=>next(err));
                    }

                }

        },(err)=>next(err))
        .catch((err)=> next(err));

})

    .delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{

    Favorites.findOne({user:req.user._id})
       // .populate('dishes')
        .then((favorite)=>{
            if (favorite!=null){
                /**Verifier si il existes ce plat dans le favoritesplate de l'utilisateur
                 * element.equals(favorite.dishes[favorite.dishes.length-1])  verifier si le compteur
                 * element est equal au dernier element du tableau
                var Boolean=false;
                for(let element of favorite.dishes){

                    if (element.equals(req.body.dishes)){
                        favorite.dishes.remove(req.body.dishes);
                        Boolean=true;
                    }
                    else if(element.equals(favorite.dishes[favorite.dishes.length-1]) &&
                        !element.equals(req.body.dishes) && !Boolean){
                        var err = new Error("This Dish isn't  in your favorites plate");
                        err.status=403;
                        return next(err);
                    }
                }*/


                if (req.body!=null) {
                    for (let element of req.body) {
                        favorite.dishes.remove(element);
                    }
                    /**Si dishes est vide supprimer le plat favorit*/
                    if(favorite.dishes.length==0)
                    {
                        favorite.remove();
                        res.statusCode = 200;
                        res.end('Operation succesful.Your favorites dishes is delete');
                    }
                    else {
                        favorite.save()
                            .then((favorite) => {
                                Favorites.findById(favorite._id)
                                    .populate('user')
                                    .populate('dishes')
                                    .then((favorite)=>{
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    },(err)=>next(err));
                            },(err)=>next(err));

                    }

                }

                // favorite.dishes.push(req.params.dishId);


            }
            else {
                var err = new Error("You haven't  favorites plate");
                err.status=403;
                return next(err);

            }

        },(err)=>next(err))
        .catch((err)=> next(err));

});


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
        Favorites.find({user:req.user._id})
            .then((favoriteuser)=>{
                if (favoriteuser!=null ){
                    /**Si indexof d'un element est inferieur a 0 c'est que l'element n'existe pas*/
                  if(favoriteuser.dishes.indexOf(req.params.dishId)<0){
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      return  res.json({'exists':false, 'favorites':favoriteuser});
                  }
                  else {
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      return  res.json({'exists':true, 'favorites':favoriteuser});
                  }
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                   return  res.json({'exists':false, 'favorites':favoriteuser});
                }
            },(err)=>next(err))
            .catch((err)=> next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{

    Favorites.findOne({user:req.user._id})
        .then((favorite)=>{
            if (favorite!=null){
                /**Verifier si il existes ceux plat dans le favoritesplate de l'utilisateur */
                for(let element of favorite.dishes){
                    if (element.equals(req.params.dishId)){
                        var err = new Error("This Dish is already in your favorites plate");
                        err.status=403;
                        return next(err);
                    }
                }

                favorite.dishes.push(req.params.dishId);
                favorite.save()
                    .then((favorite)=>{
                        Favorites.findById(favorite._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorite)=>{
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            },(err)=>next(err));
                    },(err)=>next(err));


            }
            else {
                var Favorite= new Favorites();
                Favorite.user= req.user._id;
                Favorite.dishes.push(req.params.dishId);
                Favorite.save()
                    .then((favorite)=>{
                        Favorites.findById(favorite._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorite)=>{
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            },(err)=>next(err));
                    },(err)=>next(err));

            }

        },(err)=>next(err))
        .catch((err)=> next(err));

})
    .delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{

    Favorites.findOne({user:req.user._id})
        .then((favorite)=>{
            if (favorite!=null){
                /**Verifier si il existes ce plat dans le favoritesplate de l'utilisateur
                 * element.equals(favorite.dishes[favorite.dishes.length-1])  verifier si le compteur
                 * element est equal au dernier element du tableau */
                    var Boolean = false;
                    for (let element of favorite.dishes) {

                        if (element.equals(req.params.dishId)) {
                            /**Verfier si c'est le dernier element et si la taille des
                             * plat favorites est egale a 1 donc contient qu'un seul element*/
                            if(element.equals(favorite.dishes[favorite.dishes.length - 1])
                            && favorite.dishes.length==1){
                                favorite.remove();
                                        res.statusCode = 200;
                                        //res.setHeader('Content-Type', 'application/json');
                                       // res.json(resp);
                                       res.end('Operation succesful.Your favorites dishes is delete');



                            }
                            else {
                                favorite.dishes.remove(req.params.dishId);
                                favorite.save()
                                    .then((favorite)=>{
                                        Favorites.findById(favorite._id)
                                            .populate('user')
                                            .populate('dishes')
                                            .then((favorite)=>{
                                                res.statusCode = 200;
                                                res.setHeader('Content-Type', 'application/json');
                                                res.json(favorite);
                                            },(err)=>next(err));
                                    },(err)=>next(err));


                            }
                            Boolean = true;

                        }
                        else if (element.equals(favorite.dishes[favorite.dishes.length - 1]) &&
                            !element.equals(req.params.dishId) && !Boolean) {
                            var err = new Error("This Dish isn't  in your favorites dish");
                            err.status = 403;
                            return next(err);
                        }
                    }




                /**Deuxieme methode for*/
                // var Boolean=false;
                // for(var i = 0; i <= (favorite.dishes.length -1); i++){
                //     if (favorite.dishes[i].equals(req.params.dishId)){
                //         favorite.dishes.remove(req.params.dishId);
                //         Boolean=true;
                //     }
                //     else if( i==(favorite.dishes.length -1) &&
                //         favorite.dishes[i].equals(req.params.dishId)==false && Boolean== false){
                //         var err = new Error("This Dish isn't  in your favorites plate");
                //         err.status=403;
                //         return next(err);
                //     }
                // }


               // favorite.dishes.push(req.params.dishId);

            }
            else {
                var err = new Error("You haven't  favorites dish");
                err.status=403;
                return next(err);

            }

        },(err)=>next(err))
        .catch((err)=> next(err));

});
module.exports = favoriteRouter;