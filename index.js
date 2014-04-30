var operation = require('plumber').operation;
var Report = require('plumber').Report;
var SourceMap = require('mercator').SourceMap;
var readSourceMappingComment = require('mercator').readSourceMappingComment;
var stripSourceMappingComment = require('mercator').stripSourceMappingComment;

var myth = require('myth');
var decode64 = require('base64').decode;


function decodeDataUrl(url) {
    var matches = url.match(/^data:(.+);base64,(.+)$/);
    if (! matches) {
        throw new Error('Not a data URL: ', url);
    }

    var mimeType = matches[1];
    var base64Data = matches[2];
    var data = decode64(base64Data);
    if (mimeType === 'application/json') {
        return JSON.parse(data);
    } else {
        return data;
    }
}

module.exports = function(/* no options */) {
    return operation.map(function(resource) {
        var resourcePath = resource.path() && resource.path().absolute();
        var cssData = resource.data();

        try {
            // Transpile CSS (incl. inline source map)
            var convertedCssAndMap = myth(cssData, {sourcemap: true});

            var inlineSourceMap, sourceMap;
            var dataUrl = readSourceMappingComment(convertedCssAndMap);
            if (! dataUrl) {
                // FIXME: raise error
                inlineSourceMap = decodeDataUrl(dataUrl);
                sourceMap = SourceMap.fromMapObject(inlineSourceMap);
            }

            var convertedCss = stripSourceMappingComment(convertedCssAndMap);

            return resource.withData(convertedCss, sourceMap);
        } catch(error) {
            return new Report({
                resource: resource,
                type: 'error',
                success: false,
                errors: [{
                    line:    error.line,
                    column:  error.column,
                    message: error.message
                }]
            });
        }
    });
};
