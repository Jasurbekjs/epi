const Clients = require('../models/clients');
const { Op } = require("sequelize");
const {sequelize} = require('../db');

const _ = require("lodash");
const { auth, express, jsonParser } = require('./general');
const router = express.Router();

router.post("/create", [jsonParser] , async (req, res) => {

    const client = req.body.client;

    Clients.create({ 
    	first_name:client.first_name,
    	last_name: client.last_name,
    	comment:   client.comment,
    }).then((createdClient)=>{
      res.status(200).send({status:true,created: _.pick(createdClient,['first_name', 'last_name'])})
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
        await Clients.findAndCountAll({
          where: search,
          raw: true,
          transaction: t,
          order:[['id', 'DESC']],
          limit: per_page,
          offset: (page - 1) * per_page
        }).then( async showClients => {
          return resolve(showClients);
        });
    });

    await roleCheck.then( async (showClients) => {
      let pages = Math.ceil( showClients.count / req.query.per_page);
      respData.clients = showClients.rows;
      respData.pages = pages;
    }).then(function (showClients) {
      res.status(200).send({
        'status': true, 
        'clients': respData.clients,
        'total': respData.pages
      });
    }).catch(function (err) {
      res.status(200).send({'status': false, 'error': err});
    });
  });

});

router.post("/edit/:id", [ jsonParser, auth, ] , async (req, res) => {

  const client = req.body.client;
  await Clients.update({
    first_name: client.first_name,
    last_name: client.last_name,
    comment: client.comment, 
    },{
      where:{
        id: client.id
      }
    },).then( async editClient => {
    if(editClient){
      res.status(200).send({'status': true,});
    } else {
      res.status(200).send({'status': false,});
    }
  });
});

router.post("/delete/:id", [ jsonParser, auth, ] , async (req, res) => {

  const client = req.body.client;
  let respData;

  await Clients.destroy({
    where:{
      id: client.id
    }
  }).then( deleteClient => {
    if(deleteClient){
      res.status(200).send({'status': true,});
    } else {
      res.status(200).send({'status': false,});
    }
  
  });

});

module.exports = router;