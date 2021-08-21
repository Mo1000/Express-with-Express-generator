const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const authenticate = require('../authenticate')
const cors = require('./cors')

const Favorites = require('../models/favorites')

const favoriteRouter = express.Router()
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
	Favorites.findOne({user: req.user._id})
	.populate('user')
	.populate('dishes')
	.then((favorites) => {
		res.statusCode = 200
		res.setHeader('Content-Type', 'application/json')
		res.json(favorites)
	}, (err) => next(err))
	.catch((err) => next(err))
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.findOne({user: req.user._id})
	.then((favorites) => {
		if(!favorites) {
			Favorites.create({user: req.user._id})
			.then((favorites) => {
				if(Array.isArray(req.body)) {
					for(let i=0; i<req.body.length; i++) {
						if(favorites.dishes.indexOf(req.body[i]._id) === -1)
							favorites.dishes.push(req.body[i])
					}
				}
				else {
					if(favorites.dishes.indexOf(req.body._id) === -1)
						favorites.dishes.push(req.body)
				}
				favorites.save()
				.then((favorites) => {
					Favorites.findById(favorites._id)
     .populate('user')
     .populate('dishes')
     .then((favorites) => {
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(favorites);
     })
				})
			}, (err) => next(err))
		}
		else {
			if(Array.isArray(req.body)) {
					for(let i=0; i<req.body.length; i++) {
						favorites.dishes.push(req.body[i])
					}
				}
				else {
					favorites.dishes.push(req.body)
				}	
			favorites.save()
			.then((favorites) => {
				Favorites.findById(favorites._id)
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(favorites);
    })
			}, (err) => next(err))
		}
	})
	.catch((err) => next(err))
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /favorites');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.find({user: req.user._id}).remove()
	.then((resp) => {
		res.statusCode = 200
		res.setHeader('Content-Type', 'application/json')
		res.json(resp)
	}, (err) => next(err))
	.catch((err) => next(err))
});


favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
	Favorites.findOne({user: req.user._id})
 .then((favorites) => {
  if (!favorites) {
   res.statusCode = 200;
   res.setHeader('Content-Type', 'application/json');
   return res.json({"exists": false, "favorites": favorites});
  }
  else {
   if (favorites.dishes.indexOf(req.params.dishId) < 0) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json({"exists": false, "favorites": favorites});
   }
   else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json({"exists": true, "favorites": favorites});
   }
  }
 }, (err) => next(err))
 .catch((err) => next(err))
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.findOne({user: req.user._id})
	.then((favorites) => {
		if(!favorites) {
			Favorites.create({user: req.user._id})
			.then((favorites) => {
				favorites.dishes.push({"_id": req.params.dishId})
				favorites.save()
				.then((favorites) => {
					Favorites.findById(favorites._id)
     .populate('user')
     .populate('dishes')
     .then((favorites) => {
	      res.statusCode = 200;
	      res.setHeader('Content-Type', 'application/json');
	      res.json(favorites);
     })
				})
			}, (err) => next(err))
		}
		else {
			if(favorites.dishes.indexOf(req.params.dishId) === -1)
				favorites.dishes.push({"_id": req.params.dishId})
			favorites.save()
			.then((favorites) => {
				Favorites.findById(favorites._id)
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(favorites);
    })
			}, (err) => next(err))
		}
	})
	.catch((err) => next(err))
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /favorites/:dishId');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.findOne({user: req.user._id})
	.then((favorites) => {
		if(favorites) {
			const index = favorites.dishes.indexOf(req.params.dishId)
			if(index > -1) {
				favorites.dishes.splice(index, 1)
				favorites.save()
				.then((favorite) => {
					Favorites.findById(favorite._id)
	    .populate('user')
	    .populate('dishes')
	    .then((favorite) => {
	      res.statusCode = 200;
	      res.setHeader('Content-Type', 'application/json');
	      res.json(favorite);
	    })
				}, (err) => next(err))
			}
			else {
				var err = new Error('Favorite Dish ' + req.params.dishId + ' not found');
		  err.status = 403;
		  return next(err);
				}
		}
		else {
			var err = new Error('You have no favorite dishes');
	  err.status = 403;
	  return next(err);
			}
		})
	.catch((err) => next(err))
});

module.exports = favoriteRouter