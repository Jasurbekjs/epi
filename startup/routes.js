const usersRoute = require('../routes/users');
const epiRoute = require('../routes/epi');
const statisticsRoute = require('../routes/statistics');
const clientsRoute = require('../routes/clients');
const basesRoute = require('../routes/bases');
const pdfRoute = require('../routes/pdf');
const excelRoute = require('../routes/excel');

module.exports = function(app){
	app.use('/api/users', usersRoute);
	app.use('/api/epi', epiRoute);	
	app.use('/api/clients', clientsRoute);	
	app.use('/api/bases', basesRoute);	
	app.use('/api/pdf', pdfRoute);	
	app.use('/api/excel', excelRoute);	
	app.use('/api/statistics', statisticsRoute);	
}