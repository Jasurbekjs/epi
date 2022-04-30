const Users = require('../models/users');
const { Op } = require("sequelize");
const {sequelize} = require('../db');

const _ = require("lodash");
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');

const { auth, express, jsonParser } = require('./general');
const router = express.Router();
//------------------------------
// добавление данных
router.post("/create", [jsonParser] , async (req, res) => {
    const user = req.body.baseUser;

    const first_name = user.firstName;
    const last_name = user.lastName;
    const username = user.username+'@gbh';
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(user.password, salt)
    const role = user.role;
    Users.create({ 
    	username: username,
    	password_hash: password,
    	count: 0,
    	first_name: first_name, 
    	last_name: last_name,
    	role: role,  	
    }).then((createdUser)=>{
      res.status(200).send({status:true,created: _.pick(createdUser,['username'])})
    }).catch(err=>{ res.status(200).send({created: false, ',message': err.message}); });
});
// Вход в систему
router.post("/login",jsonParser, (req, res) => {      
  const username = req.body.username;
  const password = req.body.password;
  let user = Users.findOne({where: {username: username}})
  .then(user=>{
    if(!user) { return res.status(400).send({message:"Пользователь не найден!"}); }
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if(isValidPassword)
    {
      const token = jwt.sign({
        id: user.id, 
        username: user.username, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        role: user.role, 
        territory_id: user.territory_id
      },config.get("jwtPrivateKey"));

      res.status(200).send({token:token})
    }
    else
    {
      res.status(400).send({message:'Имя или пароль неверный!'})
    }
  }).catch((err)=>{
    return res.status(400).send({message:"Ошибка системы, повторите вход"})
  });
});
// Выход из системы
router.post("/logout", [ jsonParser, auth ], (req, res) => {
    if(req.headers['x-auth-token']) delete req.headers['x-auth-token'];
    res.status(200).send({ status: true });
});
// Элементы пользователя
router.post("/items", [ jsonParser, auth ], (req, res) => {
  if ( !req.body ) { return res.sendStatus(400); }
  const user_id = req.body.user.id;
  Users.findOne({where: {id: user_id},raw: true,})
  .then(user=>{
    let navbar_items=[];
    switch(user.role)
    {
      case 'supervisor' : navbar_items=[
        {
          title:'Уведомления',
          nameRoute:'AdminNotifications',
          route:'admin/notifications',
        },
        {
          title:'Статистика',
          nameRoute:'AdminStatistics',
          route:'admin/statistics',
        },
        {
          title:'База',
          nameRoute:'AdminBase',
          route:'admin/base',
        },
      ]; break;
      case 'admin' : navbar_items=[
        {
          title:'Уведомления',
          nameRoute:'AdminNotifications',
          route:'admin/notifications',
        },
        {
          title:'Статистика',
          nameRoute:'AdminStatistics',
          route:'admin/statistics',
        },
        {
          title:'База',
          nameRoute:'AdminBase',
          route:'admin/base',
        },
      ]; break;
      case 'operator' : navbar_items=[
        {
          title:'Уведомления',
          nameRoute:'OperatorNotifications',
          route:'operator/notifications',
        },
        {
          title:'Статистика',
          nameRoute:'OperatorStatistics',
          route:'operator/statistics',
        },
      ]; break;
      default: navbar_items=[];
    }
    res.status(200).send({navbar_items: navbar_items, user: _.pick(user,['first_name', 'last_name', 'username', 'role'])})
  }).catch((err)=>{
    return res.status(400).send({message:"Ошибка системы, повторите вход"})
  });
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
        await Users.findAndCountAll({
          where: search,
          raw: true,
          transaction: t,
          order:[['id', 'DESC']],
          limit: per_page,
          offset: (page - 1) * per_page
        }).then( async users => {
          return resolve(users);
        });
    });

    await roleCheck.then( async (users) => {
      let pages = Math.ceil( users.count / req.query.per_page);
      respData.users = users.rows;
      respData.pages = pages;
    }).then(function (result) {
      res.status(200).send({
        'status': true, 
        'users': _.takeWhile(respData.users, function(o) { delete o.password_hash; return o;}),
        'total': respData.pages
      });
    }).catch(function (err) {
      res.status(200).send({'status': false, 'error': err});
    });
  });

});

router.post("/edit/:id", [ jsonParser, auth, ] , async (req, res) => {

  const baseUser = req.body.baseUser;
  const user = req.body.user;
  const salt = await bcrypt.genSalt();
  const password = await bcrypt.hash(baseUser.password, salt)
  await Users.update({
    username: baseUser.username,
    password_hash: password,
    first_name: baseUser.first_name, 
    last_name: baseUser.last_name,
    role: baseUser.role,
    },{
      where:{
        id: baseUser.id
      }
    },).then( async baseUser => {
    if(baseUser){
      res.status(200).send({'status': true,});
    } else {
      res.status(200).send({'status': false,});
    }
  });
});

router.post("/getall", [ jsonParser, auth, ] , async (req, res) => {

  let respData = {};

  return sequelize.transaction( async function (t){

    let roleCheck = new Promise( async (resolve, reject) => {
        await Users.findAll({
          raw: true,
          transaction: t,
        }).then( async users => {
          return resolve(users);
        });
    });

    await roleCheck.then( async (users) => {
      respData.users = users;
    }).then(function (result) {
      res.status(200).send({
        'status': true, 
        'users': _.takeWhile(respData.users, function(o) { delete o.password_hash; return o;}),
      });
    }).catch(function (err) {
      res.status(200).send({'status': false, 'error': err});
    });
  });

});

router.post("/delete/:id", [ jsonParser, auth, ] , async (req, res) => {

  const baseUser = req.body.baseUser;

  await Users.destroy({
    where:{
      id: baseUser.id
    }
  }).then( deleteUser => {
    if(deleteUser){
      res.status(200).send({'status': true,});
    } else {
      res.status(200).send({'status': false,});
    }
  
  });
  
});

module.exports = router;