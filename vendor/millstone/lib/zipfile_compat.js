var fs = require('fs');
var path = require('path');
var AdmZip = require('adm-zip');
var mkdirp = require('mkdirp');

function ZipFile(file) {
    this.file = file;
    this.zip = new AdmZip(file);
    this.names = this.zip.getEntries().map(function(entry) {
        return entry.entryName;
    });
}

ZipFile.prototype.copyFile = function(name, dest, callback) {
    var entry;
    try {
        entry = this.zip.getEntry(name);
        if (!entry) throw new Error('Zip entry not found: ' + name);
    } catch (err) {
        return process.nextTick(function() { callback(err); });
    }

    mkdirp(path.dirname(dest), 0755, function(err) {
        if (err) return callback(err);
        fs.writeFile(dest, entry.getData(), callback);
    });
};

module.exports.ZipFile = ZipFile;
