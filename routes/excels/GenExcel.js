const ExcelJS = require("exceljs");
const fs = require('fs');
const Users = require('../../models/users');
const Clients = require('../../models/clients');

async function GenExcel(notifications){
  let workbook = new ExcelJS.Workbook();
  let worksheet = workbook.addWorksheet('main');
  worksheet.columns = [
    { header: '№', key: 'num', width: 10 },
    { header: 'Дата', key: 'date', width: 20 },
    { header: 'Партия файла', key: 'party', width: 15},
    { header: 'Транспорт', key: 'transport', width: 30 },
    { header: 'Товаров', key: 'goods', width: 10 },
    { header: 'Клиент', key: 'client', width: 30},
    { header: 'Статус', key: 'status', width: 20},
    { header: 'Оператор', key: 'operator', width: 20},
    { header: 'Ключ', key: 'keys', width: 30},
    { header: 'Код системы', key: 'code', width: 20},
    { header: 'Комментарий', key: 'comment', width: 20},
    { header: 'Партий в доке', key: 'cmr_party', width: 15},
  ];
  let users = [];
  await Users.findAll({ attributes: ['username', 'first_name', 'last_name'], raw: true}).then( async user => {
    users = user;
  });
  let clients = [];
  await Clients.findAll({ attributes: ['id', 'first_name', 'last_name'], raw: true}).then( async client => {
    clients = client;
  });
  for(let i=0; i<notifications.length; i++){
    worksheet.addRow({
      num : notifications[i].id,
      date : toLocaleTime(notifications[i].createdAt).date,
      party : notifications[i].party,
      transport : notifications[i].tractor,
      goods : notifications[i].goods,
      client : getClient(notifications[i].client_id, clients),
      status : getStatuse(notifications[i].status),
      operator : getOperator(notifications[i].operator, users),
      keys : notifications[i].declarant,
      code : notifications[i].doc_number,
      comment : notifications[i].comment,
      cmr_party : notifications[i].consignments
    });
  }

  await workbook.xlsx.writeFile(__dirname+'/notifications.xlsx');
};

let toLocaleTime = (date)=>{
  let dateTime = new Date(String(date)).toLocaleString('ru-RU');
  dateTime = dateTime.split(', ');
  if(String(dateTime[0].trim().includes('/'))){
    dateTime[0].replace('/','.')
  }
  return {
    date: dateTime[0],
    time: dateTime[1]
  }
}

let getStatuse = (status) => {
  switch(status){
    case 0: status = "Отменен"; break;
    case 1: status = "Зарегистрирован"; break;
    case 2: status = "Срочно"; break;
    default: status = "";
  }
  return status;
}
let getOperator = (operator, users) => {
  for(let i=0; i<users.length; i++){
    if(users[i].username == operator){
      operator = `${users[i].first_name} ${users[i].last_name}`;
      return operator;
    }
  }
}
let getClient = (client, clients) => {
  for(let i=0; i<clients.length; i++){
    if(clients[i].id == client){
      client = `${clients[i].first_name} ${clients[i].last_name}`;
      return client;
    }
  }
}

module.exports = GenExcel;