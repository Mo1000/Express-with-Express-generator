const express = require('express');
const bodyParser = require('body-parser');
const authenticate= require('../authenticate');
const multer = require('multer');

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
    .get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /imageUpload');
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin,
        upload.single('imageFile'), (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.file);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /imageUpload');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE operation not supported on /imageUpload');
    });

module.exports = uploadRouter;