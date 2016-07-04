/* global require */
/* global module */
// jshint esversion:6

var Router = require('express').Router;
var _ = require('lodash');

function getDayRange(date) {
    return {
        start: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            0, 0, 0
        ),
        end: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            23, 59, 59
        )
    };
}

function getWeekRange(date) {
    var thisWeek = {};
    var today = getDayRange(date);
    var weekDay = today.start.getDay();
    var MS_IN_A_DAY = 86400000;

    var startOffset = weekDay === 0 ? weekDay + 6 : weekDay - 1;
    var endOffset = weekDay === 0 ? 6 - (weekDay + 6) : 6 - (weekDay - 1);

    thisWeek.start = new Date(today.start.getTime() - (MS_IN_A_DAY * startOffset));
    thisWeek.end = new Date(today.end.getTime() + (MS_IN_A_DAY * endOffset));

    return thisWeek;
}

function findDocsInRange(db, start, end) {
    return new Promise((resolve, reject) => {
        db.allDocs({ include_docs: true }).then(results => {
            var docs = [];
            _.forEach(results.rows, doc => {
                var time = new Date(parseInt(doc.id.split('_')[1]));
                if (time.getTime() >= start.getTime() && time.getTime() <= end.getTime()) {
                    docs.push(doc);
                }
            });
            resolve(docs);
        }).catch(reject);
    });
}

module.exports = function(config) {
    var reportsRouter = new Router();

    reportsRouter.get('/day', function(req, res) {
        var dayToGet = req.query.for ? new Date(parseInt(req.query.for)) : new Date();
        var today = getDayRange(dayToGet);
        findDocsInRange(config.db, today.start, today.end).then(docs => {
            res.status(200).json({
                start: today.start.toString(),
                end: today.end.toString(),
                entries: docs
            });
        }).catch(error => {
            res.status(error.status).json(error);
        });
    });

    reportsRouter.get('/week', function(req, res) {
        var datePassedIn = req.query.for ? new Date(parseInt(req.query.for)) : new Date();
        var thisWeek = getWeekRange(datePassedIn);
        findDocsInRange(config.db, thisWeek.start, thisWeek.end).then(docs => {
            res.status(200).json({
                start: thisWeek.start.toString(),
                end: thisWeek.end.toString(),
                entries: docs
            });
        }).catch(error => {
            res.status(error.status).json(error);
        });
    });

    return reportsRouter;
};
