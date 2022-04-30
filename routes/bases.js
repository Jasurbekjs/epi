const Clients = require('../models/clients');
const Customs = require('../models/customs');
const { Op } = require("sequelize");
const {sequelize} = require('../db');

const { auth, express, jsonParser } = require('./general');
const router = express.Router();

router.post("/notifications", [ jsonParser, auth, ] , async (req, res) => {

  let respData = {};

  return sequelize.transaction( async function (t){

      await Clients.findAll({
        attributes: ['id', 'first_name', 'last_name'],
        raw: true,
        transaction: t,
      }).then( async allClients => {
        respData.clients = allClients;
        await Customs.findAll({
          raw: true,
          transaction: t,
        }).then( async allCustoms => {
         respData.customs = allCustoms;
        });
      });

  }).then(function (allClients) {
     res.status(200).send({
       'status': true, 
       'clients': respData.clients,
       'customs': respData.customs,
     });
  }).catch(function (err) {
    res.status(200).send({'status': false, 'error': err});
  });

});

module.exports = router;