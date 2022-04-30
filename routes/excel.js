const {express, auth, bodyParser, jsonParser } = require("./general");
const router = express.Router();

const { Op } = require("sequelize");
const {sequelize} = require('../db');

const deleteFile  = require('./pdf/deleteFile');

const { generateExcel }  = require('./excels/generateExcel');

router.post("/create", [jsonParser] , async (req, res) => {
  await generateExcel(req.body.notifications).then( async (excel)=>{
    await deleteFile(excel.path).then(()=>{
      res.status(200).send({file: excel.content, status: true});
    }).catch(err=>{
      res.status(200).send({message: err, status: false});
    });
  }).catch(err=>{
    res.status(200).send({message: err, status: false});
  });
  
});

module.exports = router;