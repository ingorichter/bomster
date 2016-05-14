var R = require('ramda');

var walk = require('walk');

function diffBOMS(bomA, expectedBOM) {
	var expectedBOMClone = R.clone(expectedBOM);
	var result = {
		missingFiles: [],
		unexpectedFiles: []
	};

	// empty BOM to verify
	if (expectedBOM === undefined || !expectedBOM) {
		result.unexpectedFiles = R.clone(bomA);
	} else {
		bomA.forEach(function (fileInfo) {
			var _fileInfoIndex = R.findIndex(R.propEq('name', fileInfo.name))(expectedBOMClone);
			if (_fileInfoIndex > -1) {
				expectedBOMClone[_fileInfoIndex].found = true;
			} else {
				result.unexpectedFiles.push(fileInfo);
			}
		});

		result.missingFiles = R.filter(function (fileItem) {
			return !fileItem.found;
		}, expectedBOMClone);
	}

	return result;
}

function verifyBOM(dir, basebom) {
	return new Promise(function (resolve, reject) {
		createBOM(dir).then(function (bom) {
			basebom = basebom || {files: []};
			var diff = diffBOMS(bom.files, basebom.files);

			resolve(diff);
		}).catch(function (e) {
			reject(e);
		});
	});
}

function createBOM(dir) {
	return new Promise(function (resolve, reject) {
		var bom = {
			created: new Date(),
			files: []
		};

		const options = {
			followLinks: false,
			// directories with these names will be skipped
			filters: ['Temp', '_Temp', '.DS_Store']
		};

		var walker = walk.walk(dir, options);
		walker.on('errors', function (root, nodeStatsArray, next) {
			reject(nodeStatsArray.error);
			next();
		});

		walker.on('nodeError', function (root, nodeStatsArray, next) {
			reject(nodeStatsArray.error);
			next();
		});

		walker.on('file', function (root, fileStats, next) {
			// get rid of the path to the folder
			var path = root.substring(dir.length);
			var name = path + '/' + fileStats.name;

			var record = {
				name: name,
				size: fileStats.size,
				type: fileStats.type
			};

			bom.files.push(record);

			next();
		});

		walker.on('directory', function (root, fileStats, next) {
			next();
		});

		walker.on('end', function () {
			resolve(bom);
		});
	});
}

exports.verifyBOM = verifyBOM;
exports.createBOM = createBOM;
