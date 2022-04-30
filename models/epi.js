const { Sequelize, sequelize} = require("../db");


const EPI = sequelize.define("epi", {
  id: {
    type: Sequelize.INTEGER(7),
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  client_id: {
    type: Sequelize.INTEGER(7),
    allowNull: true
  },
  goods: {
    type: Sequelize.STRING,
    allowNull: true
  },
  party: {
    type: Sequelize.STRING,
    allowNull: true
  },
  doc_number: {
    type: Sequelize.STRING,
    allowNull: true
  },
  customs_entry: {
    type: Sequelize.STRING,
    allowNull: true
  },
  customs_destination: {
    type: Sequelize.STRING,
    allowNull: true
  },
  date_entry: {
    type: Sequelize.DATEONLY,
    allowNull: true
  },
  tractor : {
    type: Sequelize.STRING,
    allowNull: true
  },
  trailer : {
    type: Sequelize.STRING,
    allowNull: true
  },
  container : {
    type: Sequelize.STRING,
    allowNull: true
  },
  vin : {
    type: Sequelize.STRING,
    allowNull: true
  },
  carrier : {
    type: Sequelize.STRING,
    allowNull: true
  },
  driver : {
    type: Sequelize.STRING,
    allowNull: true
  },
  passport : {
    type: Sequelize.STRING,
    allowNull: true
  },
  passport : {
    type: Sequelize.STRING,
    allowNull: true
  },
  pinfl : {
    type: Sequelize.STRING,
    allowNull: true
  },
  fees : {
    type: Sequelize.STRING,
    allowNull: true
  },
  guaranteeType : {
    type: Sequelize.STRING,
    allowNull: true
  },
  guaranteeNumber : {
    type: Sequelize.STRING,
    allowNull: true
  },
  consignments: {
    type: Sequelize.STRING,
    allowNull: true
  },
  brutto: {
    type: Sequelize.STRING,
    allowNull: true
  },
  amount: {
    type: Sequelize.STRING,
    allowNull: true
  },
  declarant: {
    type: Sequelize.STRING,
    allowNull: true
  },
  validity: {
    type: Sequelize.DATEONLY,
    allowNull: true
  },
  comment: {
    type: Sequelize.STRING,
    allowNull: true
  },
  author: {
    type: Sequelize.STRING,
    allowNull: true
  },
  operator: {
    type: Sequelize.STRING,
    allowNull: true
  },
  reason: {
    type: Sequelize.STRING,
    allowNull: true
  },
  reworks: {
    type: Sequelize.INTEGER(3),
    allowNull: true
  },
  status: {
    type: Sequelize.INTEGER(1),
    allowNull: true
  }
},{
  createdAt: true,
  updatedAt: true
});

module.exports=EPI;