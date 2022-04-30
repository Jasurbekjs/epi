// общий для routes
const bodyParser = require("body-parser");
const auth = require("../middlewares/auth");
const express = require("express");

bodyParser.urlencoded({
	parameterLimit: 100000,
	limit: '50mb',
	extended: true
});

const jsonParser = bodyParser.json({limit: '50mb'});

module.exports = {
	auth,
	express,
	jsonParser
};