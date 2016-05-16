import fs from 'fs';
import path from 'path';
import test from 'ava';
var temp = require('promise-temp').track();
import bomster from '../lib/bomster';

const testdata = {
	path: 'testdata',
	sub: [
		{path: 'Contents', sub: [
			{path: 'Zatter1.js', sub: []},
			{path: 'Zatter2.js', sub: []},
			{path: 'Zatter3.js', sub: []}
		]},
		{path: 'Nothing', sub: []}
	]
};

function createDirectoryStructure(baseDir, params) {
	const base = path.join(baseDir, params.path);
	fs.mkdirSync(base);

	params.sub.forEach(entry => {
		if (entry.sub.length > 0) {
			createDirectoryStructure(base, entry);
		} else {
			var size = entry.size || 500;
			fs.writeFileSync(path.join(base, entry.path), new Array(size));
		}
	});
}

test.beforeEach(t => {
	return temp.mkdir('testdata').then(function (tempDir) {
		t.context._tempDir = path.join(tempDir, testdata.path);
		createDirectoryStructure(tempDir, testdata);
	}).catch(function (error) {
		console.error(error);
	});
});

test.afterEach(() => {
});

test('create bom', async t => {
	t.plan(1);

	const result = await bomster.createBOM(t.context._tempDir);
	t.deepEqual(result.files, [{name: '/Nothing', size: 499, type: 'file'}, {name: '/Contents/Zatter1.js', size: 499, type: 'file'}, {name: '/Contents/Zatter2.js', size: 499, type: 'file'}, {name: '/Contents/Zatter3.js', size: 499, type: 'file'}]);
});

test('should not create bom for missing directory', t => {
	t.plan(1);

	t.throws(bomster.createBOM(), /path must be a string.*/);
});

test('should not create bom for not existing directory', t => {
	t.plan(1);

	t.throws(bomster.createBOM('/does/not/exist'));
});

test('verify directory with empty bom', async t => {
	t.plan(1);

	var expected = {
		missingFiles: [],
		unexpectedFiles: [
			{name: '/Nothing', size: 499, type: 'file'},
			{name: '/Contents/Zatter1.js', size: 499, type: 'file'},
			{name: '/Contents/Zatter2.js', size: 499, type: 'file'},
			{name: '/Contents/Zatter3.js', size: 499, type: 'file'}
		]
	};

	var result = await bomster.verifyBOM(t.context._tempDir, {});
	t.deepEqual(result, expected);
});

test('verify directory with undefined bom', async t => {
	t.plan(1);

	var expected = {
		missingFiles: [],
		unexpectedFiles: [
			{name: '/Nothing', size: 499, type: 'file'},
			{name: '/Contents/Zatter1.js', size: 499, type: 'file'},
			{name: '/Contents/Zatter2.js', size: 499, type: 'file'},
			{name: '/Contents/Zatter3.js', size: 499, type: 'file'}
		]
	};

	var result = await bomster.verifyBOM(t.context._tempDir);
	t.deepEqual(result, expected);
});

test('verify directory with non matching bom', async t => {
	t.plan(1);

	var expected = {
		missingFiles: [
			{name: '/Nothing2', size: 499, type: 'file'},
			{name: '/Contents/Zatter4.js', size: 499, type: 'file'}
		],
		unexpectedFiles: [
			{name: '/Nothing', size: 499, type: 'file'},
			{name: '/Contents/Zatter2.js', size: 499, type: 'file'},
			{name: '/Contents/Zatter3.js', size: 499, type: 'file'}
		]
	};

	var result = await bomster.verifyBOM(t.context._tempDir, {files: [{name: '/Nothing2', size: 499, type: 'file'}, {name: '/Contents/Zatter1.js', size: 499, type: 'file'}, {name: '/Contents/Zatter4.js', size: 499, type: 'file'}]});
	t.deepEqual(result, expected);
});
