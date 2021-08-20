const express = require('express');
const cors = require('cors');
const app = express();

/**Le address qui seront accpter par le server*/
const whitelist = ['http://localhost:3000', 'https://localhost:3443','http://localhost:3001'];

var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log(req.header('Origin'));
        /**Si whiteList.indexOf(req.header('Origin')) est present dans l'en tete de la req
         du client  il retournera 0 ou un chiffre superieur a 0*/
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};
/**exports.cors =cors() sans aucune options au niveau de la parenthese cela veut dire
 * qui repondra avec le control Access Allow origin
 * exports.corsWithOptions =cors(corsOptionsDelegate()); Pour lui donner un options*/
exports.cors =cors();
exports.corsWithOptions =cors(corsOptionsDelegate);