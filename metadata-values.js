var config = require('./config'),
    should = require('should'),
    rp = require('request-promise'),
    Multipart = require('multipart-stream');

describe('metadata-values', function() {

  var keyvalue1 = {
    "metadataValues": {
      "fookey" : "barval"
    }
  };

  var uri1 =  'http://' + config.host + ':' + config.restSetup["rest-api"]["port"];
      uri1 += '/v1/documents?uri=/havana.json&category=metadata-values';

  it('should PUT a metadata value to an existing document', function(done) {
    var options = {
      method: 'PUT',
      uri: uri1,
      body: keyvalue1,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      resolveWithFullResponse: true,
      auth: config.auth
    };
    rp(options)
      .then(function (response) {
        response.statusCode.should.equal(204);
        done();
      })
      .catch(done);
  });

  var uri2 =  'http://' + config.host + ':' + config.restSetup["rest-api"]["port"];
      uri2 += '/v1/documents';

  it('should POST a new document with a metadata value', function(done) {

    var keyvalue2 = {
      "metadataValues": {
        "barkey" : "bazval"
      }
    };

    var mp = new Multipart('BOUNDARY');
    mp.addPart({
      headers: {
        "Content-type": "application/json",
        "Content-Disposition": "inline;category=metadata"
      },
      body: JSON.stringify(keyvalue2)
    });
    mp.addPart({
      headers: {
        "Content-type": "application/json",
        "Content-Disposition": "inline;extension=json"
      },
      body: JSON.stringify({"bar": "baz"})
    });

    var data = ''
    mp.on('data', function(d) {
      data += d
    }).on('end', function() {
      var options = {
        method: 'POST',
        uri: uri2,
        headers: {
          'Content-type': 'multipart/mixed; boundary=BOUNDARY',
          'Accept': 'application/json'
        },
        body: data,
        resolveWithFullResponse: true,
        auth: config.auth
      };
      rp(options)
        .then(function (response) {
          response.statusCode.should.equal(200);
          var body = JSON.parse(response.body);
          should.exist(body.documents[0].uri);
          done();
        })
        .catch(done);

    })

  });

  var uri3 =  'http://' + config.host + ':' + config.restSetup["rest-api"]["port"];
      uri3 += '/v1/documents?uri=/havana.json&category=metadata-values';

  it('should GET metadata values for an existing document', function(done) {
    var options = {
      method: 'GET',
      uri: uri3,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      resolveWithFullResponse: true,
      auth: config.auth
    };
    rp(options)
      .then(function (response) {
        response.statusCode.should.equal(200);
        response.body.metadataValues.should.have.property('fookey', 'barval');
        done();
      })
      .catch(done);
  });

  var uri4 =  'http://' + config.host + ':' + config.restSetup["rest-api"]["port"];
      uri4 += '/v1/documents?uri=/havana.json&category=metadata-values';

  it('should DELETE metadata values from an existing document', function(done) {
      var options = {
      method: 'DELETE',
      uri: uri4,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      resolveWithFullResponse: true,
      auth: config.auth
    };
    rp(options)
      .then(function (response) {
        response.statusCode.should.equal(204);
        var options = {
          method: 'GET',
          uri: uri3,
          json: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          resolveWithFullResponse: true,
          auth: config.auth
        };
        rp(options)
          .then(function (response) {
            response.statusCode.should.equal(200);
            response.body.metadataValues.should.not.have.property('fookey', 'barval');
            done();
          })
          .catch(done);
      })
      .catch(done);
  });

});
