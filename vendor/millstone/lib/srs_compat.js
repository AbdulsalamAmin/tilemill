var constants = require('./srs_constants');

function copy(obj) {
    var out = {};
    for (var key in obj) out[key] = obj[key];
    return out;
}

function oc(list) {
    var out = {};
    for (var i = 0; i < list.length; i++) out[list[i]] = true;
    return out;
}

function splitProj(literal) {
    var pairs = {};
    literal.split(' ').sort().forEach(function(part) {
        if (part.indexOf('=') === -1) return;
        var pair = part.split('=');
        if (pair[1] === '0') pair[1] = '0.0';
        pairs[pair[0]] = pair[1];
    });
    return pairs;
}

function forceMerc(result) {
    var out = copy(constants.canonical.spherical_mercator);
    out.input = result.input;
    return out;
}

function forceWgs84(result) {
    var out = copy(constants.canonical.wgs84);
    out.input = result.input;
    return out;
}

function result(input, proj4) {
    return {
        input: input,
        name: undefined,
        proj4: proj4,
        srid: undefined,
        auth: undefined,
        pretty_wkt: undefined,
        esri: false,
        valid: true,
        is_geographic: proj4.indexOf('+proj=longlat') !== -1
    };
}

function parse(arg) {
    if (arg instanceof Buffer) arg = arg.toString();
    if (!arg) throw new Error('Invalid spatial reference');

    var input = String(arg);
    var lower = input.toLowerCase();
    var base = { input: input };

    if (lower.indexOf('+init=') > -1 || lower.indexOf('epsg:') > -1) {
        var code = +lower.split(':').pop().replace(/[^0-9].*$/, '');
        if (constants.merc_srids.indexOf(code) > -1) return forceMerc(base);
        if (code === 4326) return forceWgs84(base);
    }

    if (input.indexOf('+proj=') > -1) {
        var parsed = result(input, input);
        if (input.indexOf('+proj=longlat') > -1) return forceWgs84(parsed);
        if (input.indexOf('+proj=merc') > -1) {
            var canonical = JSON.stringify(splitProj(constants.canonical.spherical_mercator.proj4));
            if (JSON.stringify(splitProj(input)) === canonical) return forceMerc(parsed);
        }
        return parsed;
    }

    if (lower.indexOf('wgs 84') > -1 && lower.indexOf('mercator') === -1) {
        return forceWgs84(base);
    }

    var mercNames = oc(constants.merc_names.map(function(name) { return name.toLowerCase(); }));
    for (var name in mercNames) {
        if (lower.indexOf(name) > -1) return forceMerc(base);
    }
    if (lower.indexOf('web_mercator') > -1 ||
        lower.indexOf('pseudo-mercator') > -1 ||
        lower.indexOf('pseudo_mercator') > -1) {
        return forceMerc(base);
    }

    throw new Error('Unsupported spatial reference without GDAL: ' + input.substr(0, 120));
}

function jsonCrs(gj) {
    if (gj.crs && gj.crs.properties) {
        return gj.crs.properties.urn || gj.crs.properties.name;
    }
    return constants.canonical.wgs84.proj4;
}

module.exports.version = '1.2.0-compat';
module.exports.canonical = constants.canonical;
module.exports.split_proj = splitProj;
module.exports.parse = parse;
module.exports.jsonCrs = jsonCrs;
