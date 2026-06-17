var assert = require('assert');
var fs = require('fs');
var path = require('path');
var diff = require('difflet')({ indent : 2 });
var core;
var tile;

function readJSON(name) {
    var json = fs.readFileSync(path.resolve(__dirname, 'fixtures', name + '.json'), 'utf8');
    return JSON.parse(json);
}

function removeTimestamp(url) {
    return url.replace(/\?.*$/, '');
}

function cleanProject(proj) {
    if (!proj) return;
    delete proj._updated;
    if (Array.isArray(proj.tiles)) proj.tiles = proj.tiles.map(removeTimestamp);
    if (Array.isArray(proj.grids)) proj.grids = proj.grids.map(removeTimestamp);
}

describe('Testing Project Functions (project.test.js)', function() {

before(function(done) {
    require('./support/start').start(function(command) {
        core = command.servers['Core'];
        tile = command.servers['Tile'];
        done();
    });
});

after(function(done) {
    core.close();
    tile.close();
    done();
});

it('collection should list projects', function(done) {
    assert.response(core,
        { url: '/api/Project' },
        { status: 200 },
        function(res) {
            var body = JSON.parse(res.body);
            cleanProject(body[0]);
            assert.deepEqual(readJSON('existing-project'), body[0]);
            done();
        }
    );
});

var _updated;
var demo02Updated;
it('model should load JSON', function(done) {
    assert.response(core,
        { url: '/api/Project/demo_01' },
        { status: 200 },
        function(res) {
            var body = JSON.parse(res.body);
            _updated = body._updated;
            cleanProject(body);
            assert.deepEqual(readJSON('existing-project'), body);
            done();
        }
    );
});
it('model should not have an update', function(done) {
    assert.response(core,
        { url: '/api/Project/demo_01/' + _updated },
        { body: '{}', status: 200 },
        function(res) { done(); }
    );
});
it('model should have an update', function(done) {
    assert.response(core,
        { url: '/api/Project/demo_01/' + (+_updated - 1000) },
        { status: 200 },
        function(res) {
            var body = JSON.parse(res.body);
            cleanProject(body);
            assert.deepEqual(readJSON('existing-project'), body);
            completed = true;
            done();
        }
    );
});

it('PUT should create a project', function(done) {
    var completed = false;
    var data = readJSON('create-project');
    assert.response(core,
        {
            url: '/api/Project/demo_02',
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'cookie': 'bones.token=' + data['bones.token']
            },
            data: JSON.stringify(data)
        },
        { status: 200 },
        function(res) {
            var body = JSON.parse(res.body);
            demo02Updated = body._updated;
            cleanProject(body);
            var expected = {
                tiles: ["http://127.0.0.1:20008/tile/demo_02/{z}/{x}/{y}.png"],
                grids: ["http://127.0.0.1:20008/tile/demo_02/{z}/{x}/{y}.grid.json"]
            };
            // https://github.com/tilemill-project/tilemill/issues/1552
            //assert.deepEqual(expected, body, diff.compare(expected, body));
            done();
        }
    );
});

it('PUT should advance project update timestamp', function(done) {
    var data = readJSON('create-project');
    data._updated = demo02Updated + 60000;
    data.Stylesheet[0].data = data.Stylesheet[0].data.replace('#fff', '#fefefe');
    assert.response(core,
        {
            url: '/api/Project/demo_02',
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'cookie': 'bones.token=' + data['bones.token']
            },
            data: JSON.stringify(data)
        },
        { status: 200 },
        function(res) {
            var body = JSON.parse(res.body);
            assert.ok(body._updated > data._updated, body._updated + ' <= ' + data._updated);
            assert.ok(body.tiles[0].indexOf('updated=' + body._updated) !== -1);
            demo02Updated = body._updated;
            done();
        }
    );
});

it('GET should load created project', function(done) {
    assert.response(core,
        { url: '/api/Project/demo_02' },
        { status: 200 },
        function(res) {
            var body = JSON.parse(res.body);
            cleanProject(body);
            var expected = readJSON('created-project');
            // https://github.com/tilemill-project/tilemill/issues/1552
            //assert.deepEqual(expected, body, diff.compare(expected, body));
            done();
        }
    );
});

it('DELETE should remove project', function(done) {
    var data = readJSON('create-project');
    assert.response(core, {
        url: '/api/Project/demo_02',
        method: 'DELETE',
        headers: {
            'content-type': 'application/json',
            'cookie': 'bones.token=' + data['bones.token'],
            'Content-Length': Buffer.byteLength(JSON.stringify({ 'bones.token': data['bones.token'] }))
        },
        data: JSON.stringify({ 'bones.token': data['bones.token'] })
    }, { status: 200 }, function(res) {
        assert.equal(res.body, '{}');
        done();
    });
});

it('PUT should fail with invalid id', function(done) {
    var data = readJSON('create-project');
    data.id = 'Bad !@!ID';
    assert.response(core, {
        url: '/api/Project/Bad%20!@!ID',
        method: 'PUT',
        headers: {
            'content-type': 'application/json',
            'cookie': 'bones.token=' + data['bones.token'],
            'accept': 'application/json'
        },
        data: JSON.stringify(data)
    }, { status: 409 }, function(res) {
        var body = JSON.parse(res.body);
        delete body.stack;
        assert.deepEqual({
            message: "Filename may only include alphanumeric characters, dashes and underscores."
        }, body);
        assert['throws'](function() {
            fs.statSync(path.join(__dirname, 'fixtures', 'files', 'project', 'Bad !@!ID'));
        }, /ENOENT/);
        done();
    });
});

it('PUT should fail with invalid stylesheet', function(done) {
    var data = readJSON('invalid-project');
    assert.response(core, {
        url: '/api/Project/demo_01',
        method: 'PUT',
        headers: {
            'content-type': 'application/json',
            'cookie': 'bones.token=' + data['bones.token'],
            'accept': 'application/json'
        },
        data: JSON.stringify(data)
    }, { status: 409 }, function(res) {
        var body = JSON.parse(res.body);
        delete body.stack;
        assert.deepEqual({
            message: "style.mss:2:2 Invalid value for background-color, the type color is expected. blurb (of type keyword) was given."
        }, body);
        done();
    });
});

});
