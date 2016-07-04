/* global require */
/* global module */
// jshint esversion:6

var Router = require('express').Router;
var _ = require('lodash');

module.exports = function(config) {
    var docType = 'log_';
    var logsRouter = new Router();

    logsRouter.get('/', (req, res) => {
        config.db.allDocs({ include_docs: true }).then(result => {
            res.status(200).json(result);
        }).catch(error => {
            res.status(500).json(error);
        });
    });

    logsRouter.post('/', (req, res) => {
        if (req.body.date) {
            if (_.isString(req.body.date)) {
                req.body.date = Date.parse(req.body.date);
            }
        }
        else {
            req.body.date = Date.now();
        }
        var id = docType + req.body.date;

        config.db.put(req.body, id).then(result => {
            res.status(201).json(result);
        }).catch(error => {
            res.status(error.status).json(error);
        });
    });

    logsRouter.put('/:id', (req, res) => {
        req.body._id = req.params.id;
        config.db.get(req.params.id).then(result => {
            req.body._rev = result._rev;
            return config.db.put(req.body);
        }).then(result => {
            res.status(200).json(result);
        }).catch(error =>{
            if (error.status === 404) {
                res.status(404).json('Document not found');
            }
            else {
                res.status(500).json(error);
            }
        });
    });

    logsRouter.delete('/:id', (req, res) => {
        req.body._id = req.params.id;
        config.db.get(req.params.id).then(result =>{
            req.body._rev = result._rev;
            return config.db.remove(req.body);
        }).then(result => {
            res.status(200).json(result);
        }).catch(error =>{
            if (error.status === 404) {
                res.status(404).json('Document not found');
            }
            else {
                res.status(500).json(error);
            }
        });
    });

    return logsRouter;
};
