const EPI = require('../models/epi');

const { Op } = require("sequelize");
const {sequelize} = require('../db');

const _ = require("lodash");

const { auth, express, jsonParser } = require('./general');
const router = express.Router();

const Parser = require('./parser/parser');

const { send } = require('./pdf/sendMail')
const { generatePDF }   = require('./pdf/generatePDF');
const deleteFile  = require('./pdf/deleteFile');

router.post("/fasttext", [jsonParser] , async (req, res) => {

  let respData={}, temp;
  let fastText = req.body.fastText;
  Parser(respData, temp, fastText);  

  console.log(respData)

  /////////////////////////////////////////////////

  let today = new Date().toISOString().split('T')[0];

  await EPI.findOne({
    where : {
      [Op.or]: [
        { 
          date_entry: {
           [Op.between]: [respData.date_entry, today],
          },
          tractor : respData.tractor,
        },
        {
          date_entry: {
           [Op.between]: [respData.date_entry, today],
          },
          doc_number : respData.doc_number,
        }
      ]
      
    }
  }).then(async (result)=>{
    respData.error={
      state:false,
      message:'',
      transport:'',
      updatedAt:'',
      operator:'',
      party:'',
      client:'',
      doc_number:''
    }
    if(result){

      respData.error={
        state:true,
        message:'',
        transport:result.tractor,
        updatedAt:result.updatedAt.toLocaleString('ru-RU').replace(',', ''),
        operator:result.operator,
        party:result.party,
        client:result.client_id,
        doc_number:result.doc_number,
      }
      if(result.doc_number == respData.doc_number){
        respData.error.message='Этот Код документа был регистрирован в течении 3х последних';
      }
      if(result.tractor == respData.tractor){
        respData.error.message='Этот А/Т был регистрирован в течении 3х последних дней';
      }
      
    }
  })


  res.status(200).send({
  	status:true,
  	respData: respData,
  });
});

router.post("/create", [jsonParser, auth,] , async (req, res) => {

    const notification = req.body.notification;
    const user = req.body.user;
    EPI.create({ 
        client_id : notification.client_id,
        goods : notification.goods,
        party : notification.party,
        doc_number : notification.doc_number,
        customs_entry : notification.customs_entry,
        customs_destination : notification.customs_destination,
        date_entry : notification.date_entry,
        tractor : notification.tractor,
        trailer : notification.trailer,
        container : notification.container,
        vin : notification.vin,
        carrier : notification.carrier,
        driver : notification.driver,
        passport : notification.passport,
        pinfl : notification.pinfl,
        fees : notification.fees,
        guaranteeType : notification.guaranteeType,
        guaranteeNumber : notification.guaranteeNumber,
        consignments : notification.consignments,
        brutto : notification.brutto,
        amount : notification.amount,
        declarant : notification.declarant,
        validity : notification.validity,
        comment : notification.comment,
        author : user.username,
        operator : user.username,
        reason : '',
        reworks : 0,
        status : 1,
    }).then(async (createdEPI)=>{
      await generatePDF(notification).then(async (pdf)=>{
        await send(pdf, notification).then(async (info)=>{
          await deleteFile(pdf.path).then(()=>{
            if(info){
              res.status(200).send({ status: true, info: info});
            } else {
              res.status(200).send({ status: false});
            }
          })
        })
      })
    }).catch(err=>{ res.status(200).send({created: false, ',message': err.message}); });
});

router.get("/show", [ jsonParser, auth, ] , async (req, res) => {

  let respData = {};
  const page = parseInt(req.query.page);
  const per_page = parseInt(req.query.per_page);

  let search = JSON.parse(JSON.stringify(req.query));
  delete search.page;
  delete search.per_page;
  
  return sequelize.transaction( async function (t){

    let roleCheck = new Promise( async (resolve, reject) => {
      if(Object.keys(search).length === 0){
        await EPI.findAndCountAll({
          raw: true,
          transaction: t,
          order:[['date_entry', 'DESC'], ['id', 'DESC']],
          limit: per_page,
          offset: (page - 1) * per_page
        }).then( async showEPI => {
          return resolve(showEPI);
        });
      } else {
        if(search.date_entry_from){ // есть дата от
          if(search.date_entry_to){ // есть дата до
            let from = search.date_entry_from;
            let to = search.date_entry_to;
            delete search.date_entry_from;
            delete search.date_entry_to;
            search.date_entry = {[Op.between]: [from, to]};
          } else { // нет даты до
            let from = search.date_entry_from;
            delete search.date_entry_from;
            search.date_entry = from;
          }
        } else { // не даты от
          if(search.date_entry_to){
            let to = search.date_entry_to;
            delete search.date_entry_to;
            search.date_entry = to;
          }
        }
        await EPI.findAndCountAll({
          where: search,
          raw: true,
          transaction: t,
          order:[['date_entry', 'ASC'], ['party', 'ASC']],
        }).then( async showEPI => {
          return resolve(showEPI);
        });
      }
        
    });

    await roleCheck.then( async (showEPI) => {
      let pages = Math.ceil( showEPI.count / req.query.per_page);
      respData.notificaitons = showEPI.rows;
      respData.pages = pages;
    }).then(function (showClients) {
      res.status(200).send({
        'status': true, 
        'notificaitons': respData.notificaitons,
        'total': respData.pages
      });
    }).catch(function (err) {
      res.status(200).send({'status': false, 'error': err});
    });
  });

});
router.get("/myshow", [ jsonParser, auth, ] , async (req, res) => {

  let respData = {};
  const user = req.body.user;
  const page = parseInt(req.query.page);
  const per_page = parseInt(req.query.per_page);

  return sequelize.transaction( async function (t){

    let roleCheck = new Promise( async (resolve, reject) => {
        await EPI.findAndCountAll({
          where: { 
            [Op.and]: [
              { operator: user.username },
              // { status: { [Op.not]: 1, }},
              // { status: { [Op.not]: 0, }}
            ]
          },
          raw: true,
          transaction: t,
          order:[['id', 'DESC']],
          limit: per_page,
          offset: (page - 1) * per_page
        }).then( async showEPI => {
          return resolve(showEPI);
        });
    });

    await roleCheck.then( async (showEPI) => {
      let pages = Math.ceil( showEPI.count / req.query.per_page);
      respData.notificaitons = showEPI.rows;
      if(!pages){ respData.pages = 1; }
      else { respData.pages = pages }
      
    }).then(function (showClients) {
      res.status(200).send({
        'status': true, 
        'notificaitons': respData.notificaitons,
        'total': respData.pages
      });
    }).catch(function (err) {
      res.status(200).send({'status': false, 'error': err});
    });
  });

});

router.post("/edit/:id", [ jsonParser, auth, ] , async (req, res) => {

  const notification = req.body.notification;
  const user = req.body.user;
  if(notification.reason=='null'){notification.reason=''}
  await EPI.update({
    client_id : notification.client_id,
    goods : notification.goods,
    party : notification.party,
    doc_number : notification.doc_number,
    customs_entry : notification.customs_entry,
    customs_destination : notification.customs_destination,
    date_entry : notification.date_entry,
    tractor : notification.tractor,
    trailer : notification.trailer,
    container : notification.container,
    vin : notification.vin,
    carrier : notification.carrier,
    driver : notification.driver,
    passport : notification.passport,
    passport : notification.passport,
    consignments : notification.consignments,
    brutto : notification.brutto,
    amount : notification.amount,
    declarant : notification.declarant,
    validity : notification.validity,
    comment : notification.comment,
    operator : user.username,
    reason : notification.reason+' | '+notification.newReason,
    reworks : (Number(notification.reworks)+1),
    status : 1,
    },{
      where:{
        id: notification.id
      }
    },).then( async editEPI => {
    if(editEPI){
      await generatePDF(notification).then(async (pdf)=>{
        await send(pdf, notification).then(async (info)=>{
          await deleteFile(pdf.path).then(()=>{
            if(info){
              res.status(200).send({ status: true, info: info});
            } else {
              res.status(200).send({ status: false});
            }
          })
        })
      })
    } else {
      res.status(200).send({'status': false,});
    }
  });
});

router.post("/editAdmin/:id", [ jsonParser, auth, ] , async (req, res) => {

  const notification = req.body.notification;
  const user = req.body.user;

  await EPI.update({
    client_id : notification.client_id,
    operator : notification.operator,
    status : notification.status,
    },{
      where:{
        id: notification.id
      }
    },).then( async editEPI => {
    if(editEPI){
      res.status(200).send({'status': true,});
    } else {
      res.status(200).send({'status': false,});
    }
  });
});

router.post("/deleteAdmin/:id", [ jsonParser, auth, ] , async (req, res) => {

  const notification = req.body.notification;
  const user = req.body.user;

  await EPI.destroy({
    where:{
        id: notification.id
      }
    }).then( async editEPI => {
    if(editEPI){
      res.status(200).send({'status': true,});
    } else {
      res.status(200).send({'status': false,});
    }
  });
});

module.exports = router;