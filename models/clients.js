const { Sequelize, sequelize} = require("../db");


const Clients = sequelize.define("clients", {
  id: {
    type: Sequelize.INTEGER(7),
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  last_name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  comment: {
    type: Sequelize.STRING,
    allowNull: true
  },
},{
  createdAt: true,
  updatedAt: true
});

module.exports=Clients;