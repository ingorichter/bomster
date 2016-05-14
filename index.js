#!/usr/bin/env node
var originalfs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(originalfs);
var yargs = require('yargs');

var bomster = require('./lib/bomster');

var args = yargs.usage('$0 <command> [options]')
	.command('create', 'Create a BOM file')
	.command('verify', 'Verify the contents of the BOM with the directory')
	.demand(1)
	.strict()
	.help('help')
	.epilog('2016 - Year of the Monkey')
	.argv;

var command = args._[0];

if (command === 'create') {
	const _args = yargs.reset()
		.usage('$0 create [options]')
		.demand('d')
		.option('o', {description: 'name of output file'})
		.example('$0 create -d /Applications/TextEdit.app -o bom.json', 'Create a BOM for /Applications/TextEdit.app!')
		.argv;

	bomster.createBOM(_args.d).then(function (bom) {
		if (_args.o) {
			fs.writeFileSync(path.join(process.cwd(), _args.o), JSON.stringify(bom));
		} else {
			console.log(JSON.stringify(bom));
		}
	});
} else if (command === 'verify') {
	var _args2 = yargs.reset()
		.usage('$0 verify [options]')
		.demand('d')
		.demand('i')
		.example('$0 verify -d /Applications/TextEdit.app -i bom.json', 'Verify that the folder contains the files mentioned in bom.json!')
		.argv;

	fs.readFileAsync(_args2.i).then(JSON.parse).then(function (jsonBOM) {
		bomster.verifyBOM(_args2.d, jsonBOM).then(function (diff) {
			diff.missingFiles.forEach(function (fileInfo) {
				console.log('MISSING: %s', fileInfo.name);
			});

			diff.unexpectedFiles.forEach(function (fileInfo) {
				// TODO: option to create color output
				console.log('UNEXPECTED: %s', fileInfo.name);
			});
		});
	});
} else {
	yargs.showHelp();
}
