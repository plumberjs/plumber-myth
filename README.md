plumber-myth
============

[Plumber](https://github.com/plumberjs/plumber) operation to transform
CSS sources using the [Myth](http://www.myth.io/) preprocessor.

## Example

    var myth = require('plumber-myth');

    module.exports = function(pipelines) {

        pipelines['css'] = [
            glob('styles/myth/*.css'),
            myth(),
            // ... more pipeline operations
        ];

    };


## API

### `myth()`

Transforms each input CSS resource using the
[Myth](http://www.myth.io/) preprocessor.
