var fs          = require('fs');
var postcss     = require('postcss');
var nano        = require('cssnano');
var lodash      = require('lodash');

var mdParse     = require('./lib/md_parse')
var highlight   = require('./lib/css_highlight')

module.exports = postcss.plugin('postcss-doc', function (processedCSS, options) {

    options                 = options || {};
    options.name            = options.name  !== undefined ? options.name  : 'Style Guide';
    options.style           = fs.readFileSync(themePath + '/style.css', 'utf-8').trim();
    options.statistics      = { namespaces: [], keywords: [], files: [] };

    var _identifiers        = ['@var','@mixin','@element','@component','@modifier','@block','@block-element','@block-modifier'];
    var _keywords           = _identifiers.concat(['@namespace','@keywords','@references']);
    var _regexKeywords      =  new RegExp("("+_keywords.join('|')+")( |\t)[^' '|^\n|^\r]+", "gi");
    var _regexIdentifiers   =  new RegExp("("+_identifiers.join('|')+")(\n|\r|\t)", "gi");
    var maps                = [];

    /**
     * Collect processed file identifier occurence.
     *
     * @param key
     * @param value
     */
    function addStatistics(key, value) {
        if (typeof value === "string") {
            value = value.split(',');
        }

        if (value instanceof Array) {
            value.forEach(function (val) {
                if (options.statistics[key].indexOf(val) === -1) {
                    options.statistics[key].push(val);
                }
            });
        }
    }

    /**
     * Get the processed file name and the relative path.
     *
     * @param root
     * @returns {string}
     */
    function getFile(root) {
        return root.source.input.file.replace(process.cwd()+'/', '');
    }

    /**
     * Search the document text for css-doc identifiers and parse them.
     *
     * @param comment
     * @returns {Array}
     */
    function parseIdentifiers(comment) {
        var clean_comment = comment.text.replace(/^\s+|\s+$|\s+(?=\s)/g, '');
        var pairs         = clean_comment.match(_regexKeywords);
        var keys          = clean_comment.match(_regexIdentifiers);
        var parsed_keys   = {};

        if (pairs !== null) {
            pairs.forEach(function(pair) {
                var  _key = pair.split(/\s/)[0].replace('@', '');
                var _pair = pair.split(/\s/)[1].split(',');

                parsed_keys[_key] = _pair || [];
            });
        }

        if (keys !== null) {
            keys.forEach(function(key) {
                parsed_keys[key] = [];
            });
        }

        // set default namespace to 'global'
        if (typeof parsed_keys.namespace === 'undefined') {
            parsed_keys.namespace = ['global']
        }

        return parsed_keys;
    }

    /**
     * Generate JSON file contains the processed CSS, project meta data and documentation with code.
     *
     * @param maps
     * @param css
     * @param rootStyle
     * @param options
     */
    function generateJSON(maps, css, rootStyle, options) {
        var codeStyle = fs.readFileSync(__dirname + '/node_modules/highlight.js/styles/github.css', 'utf-8').trim();
        var assign = {
            projectName: options.name,
            processedCSS: nano(css),
            rootStyle: nano(rootStyle),
            tmplStyle: nano(options.style),
            codeStyle: nano(codeStyle),
            statistics: options.statistics,
            maps: maps
        }

        console.log(assign.codeStyle);

        fs.writeFile('styleguide.json', JSON.stringify(assign), function (err) {
            if (err) {
                throw err
            }
            console.log('Successed to generate style guide for ' + maps[maps.length-1].keys.file)
        });
    }

    /**
     * Return the postCSS plugin function.
     */
    return function (root) {
        var css         = fs.readFileSync(processedCSS, 'utf-8');
        var rootStyle   = root.toString().trim();
        var parsed_keys = [];

        root.eachComment(function (comment) {

            if (comment.parent.type === 'root') {
                var rule = comment.next();
                var tmp  = [];

                // parse comment text for keys
                parsed_keys = parseIdentifiers(comment);

                // add file and relative path
                parsed_keys['file'] = getFile(root);

                // check for valid rule and collect
                while (rule !== null && (rule.type === 'rule' || rule.type === 'atrule')) {
                    tmp.push(rule.toString().trim());
                    rule = rule.next() || null;
                }

                // clean documentation block from identifiers
                comment.text = comment.text.replace(_regexKeywords, '');

                // collect some to statistics
                addStatistics('files',      parsed_keys.file);
                addStatistics('namespaces', parsed_keys['namespace']);
                addStatistics('keywords',   parsed_keys['keywords']);

                var tmplRule = tmp.join('\n');
                maps.push({
                    rule: highlight(tmplRule),
                    html: mdParse(comment.text),
                    keys: JSON.parse(JSON.stringify(parsed_keys))
                });
            }
        });

        generateJSON(maps, css, rootStyle, options);

        return root;
    }
});

