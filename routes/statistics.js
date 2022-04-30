const EPI = require('../models/epi');

const { Op } = require("sequelize");
const {sequelize} = require('../db');

const _ = require("lodash");

const { auth, express, jsonParser } = require('./general');
const router = express.Router();

router.post("/operator", [jsonParser, auth] , async (req, res) => {

	let respData={};
  const search = req.body.search;
  const user = req.body.user;
  let elasticSearch = { author : user.username};

  return sequelize.transaction( async function (t){
    if(search.date_entry_from){ // есть дата от
      if(search.date_entry_to){ // есть дата до
        elasticSearch.date_entry = {[Op.between]: [search.date_entry_from, search.date_entry_to]}
      } else { // нет даты до
        elasticSearch.date_entry = search.date_entry_from;
      }
    } else { // не даты от
      if(search.date_entry_to){
        elasticSearch.date_entry = search.date_entry_to;
      } else {
        elasticSearch.date_entry = new Date().toISOString().split('T')[0];
      }
    }
    await EPI.findAndCountAll({
      attributes:['id', 'author', 'operator', 'goods', 'consignments'],
      where: elasticSearch,
      raw: true,
      transaction: t,
    }).then( async statEPI => {
      respData.Statistics = statEPI;
      await EPI.findAndCountAll({
        attributes:['id', 'author', 'operator', 'goods', 'consignments'],
        where: { author : user.username, date_entry: new Date().toISOString().split('T')[0] },
        raw: true,
        transaction: t,
      }).then( async todayEPI => {
        respData.Statistics.Today = todayEPI;
      });
    });
  }).then(function (showClients) {
    respData.Statistics.Operator = {documents:0, edited:0, goods:0, consignments:0 };
    for(let i=0; i<respData.Statistics.rows.length; i++){
      if(respData.Statistics.rows[i].status!=0){
        respData.Statistics.Operator.documents += 1;
        respData.Statistics.Operator.goods += Number(respData.Statistics.rows[i].goods);
        respData.Statistics.Operator.consignments += Number(respData.Statistics.rows[i].consignments);
        if(respData.Statistics.rows[i].author != respData.Statistics.rows[i].operator){
          respData.Statistics.Operator.edited += 1;
        }
      }
    }
    respData.Statistics.TodayOperator = {documents:0, edited:0, goods:0, consignments:0 };
    for(let i=0; i<respData.Statistics.Today.rows.length; i++){
      if(respData.Statistics.Today.rows[i].status!=0){
        respData.Statistics.TodayOperator.documents += 1;
        respData.Statistics.TodayOperator.goods += Number(respData.Statistics.Today.rows[i].goods);
        respData.Statistics.TodayOperator.consignments += Number(respData.Statistics.Today.rows[i].consignments);
        if(respData.Statistics.Today.rows[i].author != respData.Statistics.Today.rows[i].operator){
          respData.Statistics.TodayOperator.edited += 1;
        }
      }
    }
  	res.status(200).send({
    	'status': true, 
      'statistics': respData.Statistics,
    });
  }).catch(function (err) {
    console.log(err)
    res.status(200).send({'status': false, 'error': err});
  });
});

router.post("/adminClients", [jsonParser] , async (req, res) => {

	let respData={};
	const search = req.body.search;
	let elasticSearch = {};

	return sequelize.transaction( async function (t){

      	if(search.client_id){ elasticSearch.client_id = search.client_id;} //если искать по клиенту тоже
        if(search.date_entry_from){ // есть дата от
          if(search.date_entry_to){ // есть дата до
            elasticSearch.date_entry = {[Op.between]: [search.date_entry_from, search.date_entry_to]}
          } else { // нет даты до
            elasticSearch.date_entry = search.date_entry_from;
          }
        } else { // не даты от
          if(search.date_entry_to){
            elasticSearch.date_entry = search.date_entry_to;
          } else {
            elasticSearch.date_entry = new Date().toISOString().split('T')[0];
          }
        }
        //console.log(elasticSearch)
        await EPI.findAndCountAll({
          attributes:['id', 'client_id', 'customs_entry', 'customs_destination'],
          where: elasticSearch,
          raw: true,
          transaction: t,
        }).then( async statEPI => {
          respData.Statistics = statEPI;
        });

  }).then(function (showClients) {
    let setClients=new Set();
    let setCustoms=new Set();
    for(let i=0; i<respData.Statistics.rows.length; i++){
      setClients.add(respData.Statistics.rows[i].client_id);
      setCustoms.add(respData.Statistics.rows[i].customs_entry);
    }
    respData.Statistics.Customs = [];
    let getCustoms = setCustoms.values();
    for(let i=0; i<setCustoms.size; i++){ // Customs
      respData.Statistics.Customs.push({id:getCustoms.next().value, goods:0});
    }
    respData.Statistics.Clients = [];
    let getClients = setClients.values();
    for(let i=0; i<setClients.size; i++){ // Client
      respData.Statistics.Clients[i]={client_id:getClients.next().value, goods:0, customs:[]};
      for(let j=0; j<respData.Statistics.Customs.length; j++){
        respData.Statistics.Clients[i].customs[j]={customs_entry : respData.Statistics.Customs[j].id, goods:0};
      }
    }
    respData.Statistics.Total = {Clients: 0, Customs:0 };
    for(let i=0; i<respData.Statistics.rows.length; i++){
      for(let j=0; j<respData.Statistics.Clients.length;j++){
        if(respData.Statistics.rows[i].client_id == respData.Statistics.Clients[j].client_id){
          if(respData.Statistics.rows[i].status!=0){
            respData.Statistics.Clients[j].goods += 1;
          }
          for(let k=0; k<respData.Statistics.Clients[j].customs.length; k++){
            if(respData.Statistics.rows[i].customs_entry == respData.Statistics.Clients[j].customs[k].customs_entry){
              if(respData.Statistics.rows[i].status!=0){
                respData.Statistics.Clients[j].customs[k].goods += 1;
                respData.Statistics.Total.Clients += 1;
              }
            }
          }
        }
      }
      for(let j=0; j<respData.Statistics.Customs.length;j++){
        if(respData.Statistics.rows[i].customs_entry == respData.Statistics.Customs[j].id){
          if(respData.Statistics.rows[i].status!=0){
            respData.Statistics.Customs[j].goods += 1;
            respData.Statistics.Total.Customs += 1;
          }
        }
      }
    }

    respData.Statistics.Clients.sort(function(a, b) {
      return b.goods - a.goods;
    });
    respData.Statistics.Customs.sort(function(a, b) {
      return b.goods - a.goods;
    });
    for(let i=0; i<respData.Statistics.Clients.length; i++){ // Client
      for(let j=0; j<respData.Statistics.Clients[i].customs.length; j++){ // Customs
        if(respData.Statistics.Clients[i].customs[j].customs_entry!=respData.Statistics.Customs[j].id){
          let temp = respData.Statistics.Clients[i].customs[j];
          for(let k=0; k<respData.Statistics.Clients[i].customs.length; k++){
            if(respData.Statistics.Clients[i].customs[k].customs_entry==respData.Statistics.Customs[j].id){
              respData.Statistics.Clients[i].customs[j] = respData.Statistics.Clients[i].customs[k];
              respData.Statistics.Clients[i].customs[k] = temp;
            }
          }
        }
      }
    }
  
    res.status(200).send({
      'status': true, 
      'statistics': respData.Statistics,
    });
  }).catch(function (err) {
  	console.log(err)
    res.status(200).send({'status': false, 'error': err});
  });
});

router.post("/adminOperators", [jsonParser] , async (req, res) => {

  let respData={};
  const search = req.body.search;
  let elasticSearch = {};

  return sequelize.transaction( async function (t){

        if(search.date_entry_from){ // есть дата от
          if(search.date_entry_to){ // есть дата до
            elasticSearch.date_entry = {[Op.between]: [search.date_entry_from, search.date_entry_to]}
          } else { // нет даты до
            elasticSearch.date_entry = search.date_entry_from;
          }
        } else { // не даты от
          if(search.date_entry_to){
            elasticSearch.date_entry = search.date_entry_to;
          } else {
            elasticSearch.date_entry = new Date().toISOString().split('T')[0];
          }
        }
        //console.log(elasticSearch)
        await EPI.findAndCountAll({
          attributes:['id', 'author', 'operator', 'goods', 'consignments'],
          where: elasticSearch,
          raw: true,
          transaction: t,
        }).then( async statEPI => {
          respData.Statistics = statEPI;
        });

  }).then(function (showClients) {
    let setOperators=new Set();
    for(let i=0; i<respData.Statistics.rows.length; i++){
      setOperators.add(respData.Statistics.rows[i].author);
    }
    respData.Statistics.Documents = [];
    respData.Statistics.Goods = [];
    respData.Statistics.Consignments = [];
    let getOperators = setOperators.values();
    let temp = '';
    for(let i=0; i<setOperators.size; i++){ // Customs
      temp = getOperators.next().value;
      respData.Statistics.Documents.push({username: temp, documents:0});
      respData.Statistics.Goods.push({username: temp, goods:0});
      respData.Statistics.Consignments.push({username: temp, consignments:0});
    }
    
    respData.Statistics.Total = {Documents: 0, Goods:0, Consignments:0 };
    for(let i=0; i<respData.Statistics.rows.length; i++){
      for(let j=0; j<setOperators.size;j++){
        if(respData.Statistics.rows[i].author == respData.Statistics.Documents[j].username){
          if(respData.Statistics.rows[i].status!=0){
            respData.Statistics.Documents[j].documents += 1;
            respData.Statistics.Goods[j].goods += Number(respData.Statistics.rows[i].goods);
            respData.Statistics.Consignments[j].consignments += Number(respData.Statistics.rows[i].consignments);

            respData.Statistics.Total.Documents += 1;
            respData.Statistics.Total.Goods += Number(respData.Statistics.rows[i].goods);
            respData.Statistics.Total.Consignments += Number(respData.Statistics.rows[i].consignments);
          }
        }
      }
    }

    respData.Statistics.Documents.sort(function(a, b) {
      return b.documents - a.documents;
    });
    respData.Statistics.Goods.sort(function(a, b) {
      return b.goods - a.goods;
    });
    respData.Statistics.Consignments.sort(function(a, b) {
      return b.consignments - a.consignments;
    });
    
  
    res.status(200).send({
      'status': true, 
      'statistics': respData.Statistics,
    });
  }).catch(function (err) {
    console.log(err)
    res.status(200).send({'status': false, 'error': err});
  });
});

module.exports = router;