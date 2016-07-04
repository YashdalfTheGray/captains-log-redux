/* global require */
/* global module */
// jshint esversion:6

var Router = require('express').Router;
var chalk = require('chalk');

module.exports = function() {
    var chargeCodes;

    try {
        chargeCodes = require('./charge-codes.json');
        console.log(chalk.green('charge-codes.json') + ' found.');
    }
    catch (error) {
        console.log('No ' + chalk.green('charge-codes.json') + ' file found. Please create the file if you want to add charge codes to the application.');
        chargeCodes = {
            error: 'file not found',
            message: 'to use charge codes, please create an charge-codes.json in the server folder'
        };
    }

    var chargeCodesRouter = new Router();

    chargeCodesRouter.get('/', (req, res) => {
        res.status(200).json(chargeCodes);
    });

    return chargeCodesRouter;
};
