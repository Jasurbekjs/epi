const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function auth(req, res, next){
	const token = req.header('x-auth-token');

	if(!token)
	{
		return res.status(401).send({error: "Token не обнаружен!"});
	}

	try{
		const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
		req.body.user = decoded;
		next();
	}
	catch(err){
		return res.status(400).send({error: "Token не действителен!"})
	}
}