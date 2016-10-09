var build = require('./build/build.js'),
    git = require('git-rev');

function hint(msg, args) {
	return function () {
		console.log(msg);
		jake.exec('node node_modules/eslint/bin/eslint.js ' + args,
				{printStdout: true}, function () {
			console.log('\tCheck passed.\n');
			complete();
		});
	};
}

// Returns the version string in package.json, plus a semver build metadata if
// this is not an official release
function calculateVersion(officialRelease, callback) {

	var version = require('./package.json').version;

	if (officialRelease) {
		callback(version);
	} else {
		git.short(function(str) {
			callback (version + '+' + str);
		});
	}
}

desc('Check Leaflet source for errors with ESLint');
task('lint', {async: true}, hint('Checking for JS errors...', 'src'));

desc('Check Leaflet specs source for errors with ESLint');
task('lintspec', {async: true}, hint('Checking for specs JS errors...', 'spec/suites'));

desc('Combine and compress Leaflet source files');
task('build', {async: true}, function (compsBase32, buildName, officialRelease) {
	calculateVersion(officialRelease, function(v){
		build.buildLeaflet(complete, v, compsBase32, buildName);
    build.buildGoogle(complete, v, compsBase32, buildName);
	});
});

desc('Run PhantomJS tests');
task('test', ['lint', 'lintspec'], {async: true}, function () {
	build.test(complete);
});

task('default', ['test', 'build']);

jake.addListener('complete', function () {
  process.exit();
});
