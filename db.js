const Sequelize = require("sequelize");

// определяем объект Sequelize
const sequelize = new Sequelize("hestiaJas_epi", "hestiaJas_gbh", "hestiaJas_gbh13", {
  dialect: "mysql",
  host: "localhost",
  logging: false,
});

module.exports.sequelize=sequelize;
module.exports.Sequelize=Sequelize;