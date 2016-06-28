var gulp = require('gulp');
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');
var chalk = require('chalk');
var del = require('del');
var file = require('gulp-file');
var os = require('os');
var exec = require('child_process').exec;
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

var commandBuilder = function(command) {
    "use strict";

    var cmd = {};
    var cmdArr = command.split(' ');
    cmd.exec = cmdArr.shift();
    cmd.args = cmdArr;
    return cmd;
};

var runCommand = function(command, description, cb) {
    "use strict";

    if (typeof command.exec === 'undefined') {
        command = commandBuilder(command);
    }

    var child = exec(command.exec, command.args);
    child.stdout.on('data', function(data) {
        process.stdout.write(data);
    });
    child.stderr.on('data', function(data) {
        process.stdout.write(chalk.red(data));
    });
    child.on('error', function(error) {
        console.log(error);
    });

    return child;
};

gulp.task('default', ['usage']);

gulp.task('usage', function() {
    "use strict";

    var usageLines = [
        '',
        '',
        chalk.green('usage'),
        '\tdisplay this help page.',
        '',
        chalk.green('init'),
        '\tinitializes the db directory for PouchDB.',
        '',
        chalk.green('build'),
        '\tbuild all the .jsx files into ' + chalk.cyan('dist/client/bundle.js') + ' and copies the others.',
        '',
        chalk.green('watch'),
        '\twatch for changes and run the ' + chalk.green('build') + ' task on changes.',
        '',
        chalk.green('start:nodeserver'),
        '\tstarts the node server at port 8000.',
        '',
        chalk.green('start:pouchdb'),
        '\tstarts the pouchdb server at port 5984.',
        '',
        chalk.green('clean:dist'),
        '\tdeletes the dist folder.',
        '',
        chalk.green('clean'),
        '\talias for ' + chalk.green('clean:dist') + '.',
        '',
        chalk.green('clean:modules'),
        '\tdeletes the node_modules directory.',
        '\t' + chalk.magenta('NOTE:') + ' ' + chalk.green('npm install') +
        ' will be required before running anything else.',
        '',
        chalk.green('clean:all'),
       '\truns both ' + chalk.green('clean:dist') + ' and ' + chalk.green('clean:modules') + '.',
       '',
        chalk.green('clean:db'),
        '\tdeletes the db directory, deleting the database and logs.',
        '\t' + chalk.magenta('NOTE:') + ' pouchdb server cannot ' +
        'be running when this command is run.',
        '\t' + chalk.magenta('NOTE:') + ' ' + chalk.green('gulp init') +
        ' will be required before running the pouchdb server again.',
        ''
    ];

    gutil.log(usageLines.join(os.EOL));
});

gulp.task('init', function() {
    "use strict";
    return file('log.txt', '')
        .pipe(gulp.dest('db'));
});

gulp.task('build', ['copyfiles', 'buildjsx']);

gulp.task('watch', ['build'], function() {
    "use strict";
    gulp.watch('app/client/**/*.jsx', ['buildjsx']);
    gulp.watch(['app/client/**/*', '!app/client/**/*.jsx'], ['copyclientfiles']);
    gulp.watch(['app/server/**/*', '!app/server/**/*.md', '!app/server/sample-sap-codes.json'], ['copyserverfiles']);
});

gulp.task('copyfiles', ['copyclientfiles', 'copyserverfiles']);

gulp.task('copyclientfiles', function() {
    "use strict";
    return gulp.src([
        'app/client/**/*',
        '!app/client/**/*.jsx'
    ])
    .pipe(gulp.dest('dist/client'));
});

gulp.task('copyserverfiles', function() {
    "use strict";
    return gulp.src([
        'app/server/**/*',
        '!app/server/**/*.md',
        '!app/server/sample-sap-codes.json'
    ])
    .pipe(gulp.dest('dist/server'));
});

gulp.task('buildjsx', function() {
    "use strict";
    return browserify({
        entries: 'app/client/bootstrap.jsx',
        extensions: ['.jsx'],
        debug: true
    })
    .transform('babelify', { presets: ['es2015', 'react', 'stage-0'] })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist/client'));
});

gulp.task('start:nodeserver', ['build'], function() {
    "use strict";
    nodemon({
        script: 'dist/server/server.js',
        watch: 'dist/server/*.js'
    });
});

gulp.task('start:pouchdb', function(cb) {
    "use strict";
    var command = 'pouchdb-server c';
    runCommand(command, 'PouchDB server', cb);
    gutil.log('PouchDB server is now ' + chalk.green('running') + ' on port ' + chalk.cyan('5984') + '. ');
});

gulp.task('clean:dist', function() {
    "use strict";
    return del('dist');
});

gulp.task('clean:modules', function() {
    "use strict";
    return del('node_modules');
});

gulp.task('clean:db', function() {
    return del('db');
});

gulp.task('clean', ['clean:dist']);

gulp.task('clean:all', ['clean:dist', 'clean:modules']);
