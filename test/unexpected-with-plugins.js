var expect = module.exports = require('unexpected').clone(),
    urlTools = require('urltools');

expect.addAssertion('to contain (asset|assets)', function (expect, subject, queryObj, number) {
    this.errorMode = 'nested';
    if (typeof queryObj === 'string') {
        queryObj = {type: queryObj};
    }
    if (typeof number === 'undefined') {
        number = 1;
    }
    expect(subject.findAssets(queryObj).length, 'to equal', typeof number === 'number' ? number : 1);
});

expect.addAssertion('to contain (url|urls)', function (expect, subject, urls) {
    if (!Array.isArray(urls)) {
        urls = [urls];
    }
    urls = urls.map(function (url) {
        return URL.resolve(this.obj.root, url);
    }, this);
    this.errorMode = 'nested';
    urls.forEach(function (url) {
        expect(subject.findAssets({url: url}).length, 'to equal', 1);
    });
});

expect.addAssertion('to contain (relation|relations)', function (expect, subject, queryObj, number) {
    if (typeof queryObj === 'string') {
        queryObj = {type: queryObj};
    }
    if (typeof number === 'undefined') {
        number = 1;
    }
    this.errorMode = 'nested';
    expect(subject.findRelations(queryObj).length, 'to equal', number);
});

expect.addType({
    identify: function (obj) {
        return obj && obj.isAsset;
    },
    equal: function (a, b) {
        return (
            a.type === b.type &&
            a.urlOrDescription === b.urlOrDescription &&
            (a.isText ? a.text : a.rawSrc) === (b.isText ? b.text : b.rawSrc)
            // && same outgoing relations
        );
    },
    inspect: function (asset) {
        return asset.urlOrDescription;
    },
    toJSON: function (asset) {
        return {
            $Asset: {
                type: asset.type,
                urlOrDescription: asset.urlOrDescription,
                outgoingRelations: asset.outgoingRelations
            }
        }
    }
});

expect.addType({
    identify: function (obj) {
        return obj && obj.isAssetGraph;
    },
    inspect: function (assetGraph) {
        return ['AssetGraph'].concat(assetGraph.findAssets({isInline: false}).map(function (asset) {
            return '  ' + (asset.isLoaded ? ' ' : '!') + ' ' + urlTools.buildRelativeUrl(assetGraph.root, asset.url);
        }, this)).join('\n  ');
    },
    toJSON: function (assetGraph) {
        return {
            $AssetGraph: {
                assets: assetGraph.findAssets({isInline: false}),
            }
        }
    }
});