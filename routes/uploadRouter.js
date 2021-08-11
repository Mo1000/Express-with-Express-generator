const express = require('express');
const bodyParser = require('body-parser');
const authenticate= require('../authenticate');
const multer = require('multer');
const cors = require("./cors");

/**Pour le stockage des fichiers Uploader on uitlise le
 * middleware multer.diskStorage */
const storage =multer.diskStorage({
    /** la destination prends 3 parametres  et
     * dans le callback de desitnation le premiere parametre est nul et le deuxieme est la destination
     * pour celui de filename on dit comment veut etre nommé notre fichier uploader  */
   destination: (req,file ,callback)=>{
        callback(null,'public/images');
   },

   filename:(req,file ,callback)=>{
       callback(null,file.originalname);
   }
});
/**Choisi le type de fichiers a accepter ou ne pas accepter pour le Upload*/
const imageFileFilter = (req, file, callbackb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callbackb(new Error('You can upload only image files!'), false);
    }
    callbackb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')

    /**.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
     * Pour deja introduire le Cross Origin Ressource sharing (cors) et
     definir quel address peut avoir acces a cette methode voir whiteListe
     dans cors.js
     */
    .options(cors.corsWithOptions,(req,res)=>{
        res.sendStatus(200)
    })
    .get(cors.cors,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /imageUpload');
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,
        upload.single('imageFile'), (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.file);
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /imageUpload');
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE operation not supported on /imageUpload');
    });

module.exports = uploadRouter;