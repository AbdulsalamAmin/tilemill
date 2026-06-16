var assert = require('assert');
var exec = require('child_process').exec;

var count_module = function(name,callback) {
    var cmd = 'npm ls --parseable ' + name;
    exec(cmd,
        function (error, stdout, stderr) {
            var count = stdout.trim() ? stdout.trim().split(/\n/).length : 0;
            return callback(null,count);
    });
};

describe('Testing Config Functions [config loading pwnage] (duplicate_module.test.js)', function() {

['optimist','sqlite3','@mapnik/mapnik'].forEach(function(mod) {
    it('there should only be one ' + mod + ' module otherwise you are hosed', function(done) {
         count_module(mod, function(err,count) {
            if (err) throw err;
            assert.notEqual(count,0,'you are missing the ' + mod + ' module (`npm ls ' + mod + '`)');
            assert.equal(count,1,'you have more than one copy of ' + mod + ' (`npm ls ' + mod + '`)');
            done();
        });
    });
});

});
