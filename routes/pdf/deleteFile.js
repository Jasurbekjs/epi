const fs = require('fs');

module.exports = async (path) => {
	return new Promise((resolve, reject) => {
		fs.unlink(path, function(err){
      if (err) { reject() }
      console.log('success deleted')
      resolve();
    });	
	})
}