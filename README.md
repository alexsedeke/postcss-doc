# postcss-doc [![wercker status](https://app.wercker.com/status/bff68cbb2ab30226b30a08f73d1f4f40/s/master "wercker status")](https://app.wercker.com/project/bykey/bff68cbb2ab30226b30a08f73d1f4f40)

[PostCSS](https://github.com/postcss/postcss) plugin to generate a style guide for Air.

CSS comments will be parsed through Markdown and saved in a generated JSON document.

## Install

```shell
$ npm install postcss-doc
```

## Usage

Node.js:

```js
var fs = require('fs');
var postcss = require('postcss');
var doc = require('postcss-doc');

var css = fs.readFileSync('input.css', 'utf-8');
var processedCSS = 'output.css';

var options = {
    name: "Project name"
};

var output = postcss()
    .use(doc(processedCSS, options))
    .process(css)
    .css;
```

in [Gulp](https://github.com/gulpjs/gulp):

```js
var gulp = require('gulp');

gulp.task('default', function () {
    var postcss = require('gulp-postcss');
    var processedCSS = 'output.css';
    return gulp.src('src/*.css')
        .pipe(postcss([
            require('postcss-doc')(processedCSS, {
                name: "Project name"
            })
        ]))
        .pipe(gulp.dest('build/'));
});
```

## Example css

To be done!

## Options

- `options.name`: Project name

## License

The MIT License (MIT)

Copyright (c) 2015 Jan Nahody