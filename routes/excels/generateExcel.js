const fs = require('fs');
const GenExcel = require('./GenExcel');

let generateExcel = async (notifications) => {
	return new Promise(async (resolve, reject) => {
    await GenExcel(notifications).then(()=>{
      const content = fs.readFileSync(__dirname+'/notifications.xlsx', {encoding: 'base64'});
      let result = {
      	content : content,
      	path : __dirname+'/notifications.xlsx'
      }
      resolve(result);
    });
	})
}

module.exports = { generateExcel }