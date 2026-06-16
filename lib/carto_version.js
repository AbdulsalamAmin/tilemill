var carto = require('carto');

module.exports = function(runtimeVersion) {
    var ref = new carto.tree.Reference(null);

    if (runtimeVersion) {
        try {
            ref.setVersion(runtimeVersion);
            return runtimeVersion;
        } catch (err) {}
    }

    return ref.getLatest();
};
