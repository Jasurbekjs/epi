const { Op } = require("sequelize");
const {sequelize} = require('../db');

const { send } = require('./pdf/sendMail')

const _ = require("lodash");

const { auth, express, jsonParser } = require('./general');
const router = express.Router();

const { generatePDF }   = require('./pdf/generatePDF');
const deleteFile  = require('./pdf/deleteFile');

router.post("/create", [jsonParser] , async (req, res) => {
  let notification = req.body.notification;
  try{
    await generatePDF(notification).then(async (pdf)=>{
      await deleteFile(pdf.path).then(()=>{
       res.status(200).send({ filename: `${notification.tractor} ${notification.doc_number}`, file: pdf.content, status: true});
      })
    })
  } catch(err) {
    console.log(err);
    res.status(200).send({message: err, status: false});
  }
  
});

module.exports = router;