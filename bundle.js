(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Table = require('table-builder');

const SIZE_TABLE_HEADER = '라벨 사이즈'
const parseHeaders = (data) => {
    const firstRow = (Object.values(data)[0]);

    return Object.keys(firstRow).reduce(
        (acc, key, index) => ({...acc, [index + 1]: key})
        , {'0': SIZE_TABLE_HEADER}
    );
}

const  parseData  = (headers, data) =>
    Object.entries(data).map(([size, measurements]) =>
        Object.entries(headers).reduce((acc, [headerKey, headerValue]) => (
            {...acc, [headerKey]: headerValue === SIZE_TABLE_HEADER ? size : measurements[headerValue]}
        ), {})
    );


const getSizeTable = (rawData) => {
    if (rawData === undefined) {
        return '';
    }

    const headers = parseHeaders(rawData);
    const data = parseData(headers, rawData);

    try {
    return (new Table({'class': 'size-table'}))
        .setHeaders(headers)
        .setData(data)
        .render();
    }
    catch (e) {
        console.log(e);
        return undefined;
    }
}

module.exports = { getSizeTable }

},{"table-builder":8}],2:[function(require,module,exports){
// main.js
const { getSizeTable } = require('./get-size-table.js');

window.getSizeTable = getSizeTable;

},{"./get-size-table.js":1}],3:[function(require,module,exports){
var mapObj = require('./mapobj');

module.exports = function buildTag(tag, attributes, content) {
    return buildOpenTag(attributes, tag) + content + buildCloseTag(tag);
};

function buildOpenTag(attributes, tag) {
    var attrs = mapObj(attributes, function (val, key) {
        return key + '="' + htmlEncode(val) + '"';
    }).join(' ');

    return '<' + tag + ' ' + attrs + '>';
}

function buildCloseTag(tag) {
    return '</' + tag + '>';
}

// WTF?
function htmlEncode(value) {
    return (value || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

},{"./mapobj":5}],4:[function(require,module,exports){
module.exports = function isPlainObj(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
};

},{}],5:[function(require,module,exports){
module.exports = function mapObj(obj, map) {
    var res = [];
    for(var i in obj) { if (obj.hasOwnProperty(i)) {
        res.push(map(obj[i], i));
    }}
    return res;
};

},{}],6:[function(require,module,exports){
module.exports = (function Slug () {
    var map = {"ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"","б":"b","ю":"yu"}
    return function(word) {
        return word.split('').map(function(char){
            var lo = char.toLowerCase();
            return lo in map ? map[lo] : (lo >= 'a' && lo <= 'z' || lo >= '0' && lo <= '9' ? lo : '-');
        }).join('').replace(/-+/g, '-');
    }
})();

},{}],7:[function(require,module,exports){
module.exports = function toPairs(obj) {
    var pairs = [];
    for (var i in obj) {if (obj.hasOwnProperty(i)) {
        pairs.push([i, obj[i]]);
    }}
    return pairs;
};

},{}],8:[function(require,module,exports){
var TableBuilder = (function () {
    var
        TableBuilder,
        mapObj = require('./3thparty/mapobj'),
        toPairs = require('./3thparty/topairs'),
        tag = require('./3thparty/buildtag'),
        isPlainObj = require('./3thparty/isplainobj'),
        lib = require('./lib'),
        id = function id(argument) { return argument; };

    /**
     * @param attributes object
     * example attributes object:
     *
     *  {
     *      'class' : 'table table-striped',
     *      'data-payload' : '#qw-312'
     *  }
     *
     * structured this way so we can more easily add other options in the future without
     * breaking existing implementations
     * @param caption
     */
    TableBuilder = function (attributes, caption) {
        this.attributes = attributes;
        this.headers = null;
        this.data = [];
        this.tableHtml = null;
        this.prisms = {}; // callback pre-processor collection
        this.totals = {}; // callback footer total record processors collections
        this.group = {field: '', fn: id}; // callback data group
        this.caption = caption;
    };

    TableBuilder.prototype.setPrism = function (name, fn__pattern) {
        var setPrism = (function (name) { this.prisms[name] = fn__pattern; }).bind(this);
        [].concat(name).forEach(setPrism);

        return this;
    };

    TableBuilder.prototype.setTotal = function (name, fn) {
        var names = Array.isArray(name) ? name : [name],
            this_ = this;

        names.forEach(function(name) {
            this_.totals[name] = fn;
        });

        return this;
    };

    /**
     *
     * @param field string
     * @param fn function
     * @return {exports}
     */
    TableBuilder.prototype.setGroup = function (field, fn) {
        this.group.field = field;
        this.group.fn = fn || id;

        return this;
    };

    /**
     * @param headers
     * @return {TableBuilder}
     */
    TableBuilder.prototype.setHeaders = function (headers) {
        this.headers = isPlainObj(headers) ? toPairs(headers) : headers;

        return this;
    };

    /**
     * @param {String} header - horisontal header title
     * @param {String[]} headers - vertical headers
     * @return {TableBuilder}
     */
    TableBuilder.prototype.setVertHeaders = function (headerTitle, headers) {
        this.vertHeaders = headers;
        this.headers = [['__vert_header__', headerTitle]].concat(this.headers);

        return this;
    };

    /**
     * @param data
     * @returns {TableBuilder}
     */
    TableBuilder.prototype.setData = function (data) {
        if (!data || !data.length) {
            this.data = [];
            this.tbody = '';
            return this;
        }
        if (!lib.isDataCorrect(data)) {
            throw ('invalid format - data expected to be empty, or an array of arrays.');
        }
        if (!this.headers) {
            throw ('invalid format - headers expected to be not empty.');
        }

        this.data = lib.prismData(data, this.headers, this.prisms);

        this.data = lib.joinVertHeaders(this.data, this.vertHeaders);

        // group data
        data = lib.groupData(this.data, this.group.field, this.caption);
        if (this.group.field) {
            this.headers = lib.deletedByKey(this.headers, this.group.field);
        }

        this.tbody = lib.buildBody(data, this.group.fn, this.totals);

        return this;
    };

    /**
     * Output the built table
     *
     * @return string
     */
    TableBuilder.prototype.render = function () {
        if (!this.data.length) {
            return '';
        }
        this.thead = lib.buildHeaders(this.headers);
        this.tfoot = lib.buildFooter(this.headers, this.data, this.totals);
        var guts = this.thead + this.tbody + this.tfoot;

        // table is already built and the user is requesting it again
        if (this.tableHtml) {
            return this.tableHtml;
        }

        this.tableHtml = tag('table', this.attributes, guts);

        return this.tableHtml;
    };

    return TableBuilder;
}());

if (typeof module !== 'undefined') module.exports = TableBuilder;
else if (typeof window !== 'undefined') window.TableBuilder = TableBuilder;

},{"./3thparty/buildtag":3,"./3thparty/isplainobj":4,"./3thparty/mapobj":5,"./3thparty/topairs":7,"./lib":9}],9:[function(require,module,exports){
var isPlainObj = require('./3thparty/isplainobj');
var id = function id(argument) { return argument; };
var toPairs = require('./3thparty/topairs');
var tag = require('./3thparty/buildtag');
var slug = require('./3thparty/slug');

var lib = module.exports = {
    /**
     * finds the tbody data and extracts it to an array if we were passed an object,
     * and then iterates the the row data for links
     *
     * @param data mixed
     * @return bool
     */
    isDataCorrect: function (data) {
        return data instanceof Array && (data.length === 0 || isPlainObj(data[0]));
    },

    isCellValCorrect: function (celldata) {
        // we only accept strings, or numbers as arguments
        return typeof celldata !== 'string' && typeof celldata !== 'number';
    },

    prismData: function (rows, headers, prisms) {
        return rows.map(function (row) {
            return headers.map(function (header) {
                var headerTitle = header[1], columnName = header[0];
                var cellValue = (prisms[columnName] || id)(row[columnName], row);
                return [columnName, isPlainObj(cellValue) ? cellValue : {
                    presentation: cellValue,
                    raw: row[columnName]
                }];
            });
        });
    },

    buildBody: function (rowsGroups, groupValueFn, totalsValueFn) {
        return tag('tbody', {}, rowsGroups.map(function (group) {
            var rows = group[1], groupTitle = group[0];
            if (!rows) return '';
            return lib.buildGroupTitle(rows, groupTitle, groupValueFn, totalsValueFn) + lib.buildRows(rows);
        })
        .join('\n'));
    },

    buildGroupTitle: function buildGroupTitle(rows, groupTitle, groupValueFn, totalsValueFn) {
        if (!groupTitle) return '';

        var groupTitleValue = groupValueFn(groupTitle, rows.length, lib.getTotals(rows[0], rows, totalsValueFn).value());
        var groupTitleCell = tag('td', { class: 'group-name-td', colspan: String(rows[0].length) }, groupTitleValue);

        return tag('tr', {}, groupTitleCell);
    },

    buildRows: function buildRows(rows) {
        return rows.map(function (row) {
            return row.map(function (cell) {
                var cellValue = cell[1], colName = cell[0];
                var className = slug(colName) + '-td ' + (isNaN(+(cellValue.raw)) ? 'td_text' : 'td_num');
                return tag('td', {'class': className}, cellValue.presentation);
            })
            .join('');
        })
        .map(function (tr, i) {
            var trId = rows[i][0][0] === '__vert_header__' && rows[i][0][1];
            var trAttrs = trId ? {'class': slug(trId.raw) + '-tr', 'data-id': slug(trId.raw)} : {};
            return tag('tr', trAttrs, tr);
        })
        .join('\n');
    },

    /**
     * takes an array of and produces <thead><tr><th> ... </th></tr></thead> with one th
     * for each item of the array
     *
     * @param {Object|String[][]} headers - {k:v,,,} or [[k,v],,,]
     */
    buildHeaders: function (headers) {
        var content = headers.map(function (header) {
            var headerContent = header[1], headerKey = header[0];
            return tag('th', {'class': slug(headerKey) + '-th'}, headerContent);
        });
        return '<thead><tr>' + content.join('') + '</tr></thead>';
    },

    buildFooter: function (headers, rows, totalsFn) {
        var content = lib.getTotals(headers, rows, totalsFn).map(function (tdValue) {
            return tag('td', {}, tdValue);
        });
        // check if there is a totals function, only return footer if required
        if (Object.keys(totalsFn) < 1) {
          return '';
        } else {
          return '<tfoot><tr>' + content.join('') + '</tr></tfoot>';
        }
    },

    /**
     *
     * @param headers
     * @param rows
     * @param totalsFnCollection
     */
    getTotals: function (headers, rows, totalsFnCollection) {
        return headers.map(function (header) {
            var columnName = header[0];
            var columnCells = rows.map(function(row) {
                return row.reduce(function (res, cell) { return cell[0] === columnName ? cell[1].raw : res; });
            });
            var calcTotal = function () { return ''; }

            // same totals for all headers
            if (totalsFnCollection['*'] && columnName !== '__vert_header__') calcTotal = totalsFnCollection['*'];
            else if (totalsFnCollection[columnName]) calcTotal = totalsFnCollection[columnName];
            return calcTotal(columnCells, rows)
        });
    },

    /**
     *
     * @param data
     * @param groupingField
     * @param unnamedSubstitution
     */
    groupData: function (data, groupingField, unnamedSubstitution) {
        var groupedData = {};

        if (groupingField) {
            data.forEach(function (item) {
                var group = groupedData[item[groupingField].presentation] || [];
                group.push(item);
                groupedData[item[groupingField].presentation] = group;
                delete item[groupingField];
            });
        } else {
            groupedData[unnamedSubstitution || ''] = data;
        }

        return toPairs(groupedData);
    },

    joinVertHeaders: function joinVertHeaders(data, vertHeaders) {
        if (!vertHeaders) return data;

        var joinVerHeaderToRow = function(row, i) {
            return [['__vert_header__', {
                raw: vertHeaders[i],
                presentation: vertHeaders[i]
            }]].concat(row.slice(1))
        };

        return data.map(joinVerHeaderToRow);
    },

    deletedByKey: function (pairs, key) {
        return pairs.filter(function(tuple) { return tuple[0] !== key; })
    }
};

},{"./3thparty/buildtag":3,"./3thparty/isplainobj":4,"./3thparty/slug":6,"./3thparty/topairs":7}]},{},[2]);
