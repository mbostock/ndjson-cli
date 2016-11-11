# ndjson-cli

Unix-y tools for operating on [newline-delimited JSON](http://ndjson.org) streams.

```
npm install ndjson-cli
```

## Command Line Reference

* [ndjson-cat](#ndjson_cat) - concatenate objects to form a stream
* [ndjson-filter](#ndjson_filter) - filter objects
* [ndjson-map](#ndjson_map) - transform objects
* [ndjson-reduce](#ndjson_reduce) - reduce a stream of objects to a single value
* [ndjson-split](#ndjson_split) - transform objects to streams of objects
* [ndjson-join](#ndjson_join) - join two streams of objects into a single stream
* [ndjson-sort](#ndjson_sort) - sort a stream of objects
* [ndjson-top](#ndjson_top) - select the top objects from a stream

<a name="ndjson_cat" href="#ndjson_cat">#</a> <b>ndjson-cat</b> [<i>files…</i>] [<>](https://github.com/mbostock/ndjson-cli/blob/master/ndjson-cat "Source")

Sequentially concatenates one or more input *files* containing JSON into a single newline-delimited JSON on stdout. If *files* is not specified, it defaults to “-”, indicating stdin. This command is especially useful for converting pretty-printed JSON (that contains newlines) into newline-delimited JSON. For example, to print the binaries exported by this repository’s package.json:

```
ndjson-cat package.json | ndjson-split 'Object.keys(d.bin)'
```

<a name="ndjson_filter" href="#ndjson_filter">#</a> <b>ndjson-filter</b> [<i>expression</i>] [<>](https://github.com/mbostock/ndjson-cli/blob/master/ndjson-filter "Source")

Filters the newline-delimited JSON stream on stdin according to the specified *expression*: if the *expression* evaluates truthily for the given JSON object *d* at the given zero-based index *i* in the stream, the resulting JSON object is output to stdout; otherwise, it is ignored. If *expression* is not specified, it defaults to `true`. This program is much like [*array*.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

For example, given a stream of GeoJSON features from [shp2json](https://github.com/mbostock/shapefile/blob/master/README.md#shp2json), you can filter the stream to include only the multi-polygon features like so:

```
shp2json -n example.shp | ndjson-filter 'd.geometry.type === "MultiPolygon"'
```

Or, to skip every other feature:

```
shp2json -n example.shp | ndjson-filter 'i & 1'
```

Or to take a random 10% sample:

```
shp2json -n example.shp | ndjson-filter 'Math.random() < 0.1'
```

Side-effects during filter are allowed. For example, to delete a property:

```
shp2json -n example.shp | ndjson-filter 'delete d.properties.FID, true'
```

<a name="ndjson_map" href="#ndjson_map">#</a> <b>ndjson-map</b> [<i>expression</i>] [<>](https://github.com/mbostock/ndjson-cli/blob/master/ndjson-map "Source")

Maps the newline-delimited JSON stream on stdin according to the specified *expression*: outputs the result of evaluating the *expression* for the given JSON object *d* at the given zero-based index *i* in the stream. If *expression* is not specified, it defaults to `d`. This program is much like [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

For example, given a stream of GeoJSON features from [shp2json](https://github.com/mbostock/shapefile/blob/master/README.md#shp2json), you can convert the stream to geometries like so:

```
shp2json -n example.shp | ndjson-map 'd.geometry'
```

Or you can extract the properties, and then convert to [tab-separated values](https://github.com/d3/d3-dsv):

```
shp2json -n example.shp | ndjson-map 'd.properties' | json2tsv -n > example.tsv
```

<a name="ndjson_reduce" href="#ndjson_reduce">#</a> <b>ndjson-reduce</b> [<i>expression</i> [<i>initial</i>]] [<>](https://github.com/mbostock/ndjson-cli/blob/master/ndjson-reduce "Source")

Reduces the newline-delimited JSON stream on stdin according to the specified *expression*. For each JSON object in the input stream, evaluates the *expression* for the given JSON object *d* at the given zero-based index *i* in the stream and the previous value *p*, which is initialized to *initial*. If *expression* and *initial* are not specified, they default to `p.push(d), p` and `[]`, respectively, merging all input objects into a single array (the inverse of [ndjson-split](#ndjson_split)). Otherwise, if *initial* is not specified, the first time the *expression* is evaluated *p* will be equal to the first object in the stream (*i* = 0) and *d* will be equal to the second (*i* = 1). Outputs the last result when the stream ends. This program is much like [*array*.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce).

For example, to count the number of objects in a stream of GeoJSON features from [shp2json](https://github.com/mbostock/shapefile/blob/master/README.md#shp2json), like `wc -l`:

```
shp2json -n example.shp | ndjson-reduce 'p + 1' '0'
```

To merge a stream into a feature collection:

```
shp2json -n example.shp | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}'
```

To convert a newline-delimited JSON stream of values to a JSON array, the inverse of [ndjson-split](#ndjson_split):

```
ndjson-reduce < values.ndjson > array.json
```

<a name="ndjson_split" href="#ndjson_split">#</a> <b>ndjson-split</b> [<i>expression</i>] [<>](https://github.com/mbostock/ndjson-cli/blob/master/ndjson-split "Source")

Expands the newline-delimited JSON stream on stdin according to the specified *expression*: outputs the results of evaluating the *expression* for the given JSON object *d* at the given zero-based index *i* in the stream. The result of evaluating the *expression* must be an array (though it may be the empty array if no objects should be output for the given input). If *expression* is not specified, it defaults to `d`, which assumes that the input objects are arrays.

For example, given a single GeoJSON feature collection from [shp2json](https://github.com/mbostock/shapefile/blob/master/README.md#shp2json), you can convert a stream of features like so:

```
shp2json example.shp | ndjson-split 'd.features'
```

To convert a JSON array to a newline-delimited JSON stream of values, the inverse of [ndjson-reduce](#ndjson_reduce):

```
ndjson-split < array.json > values.ndjson
```

<a name="ndjson_join" href="#ndjson_join">#</a> <b>ndjson-join</b> <i>a-file</i> <i>b-file</i> [<i>a-expression</i> [<i>b-expression</i>]] [<>](https://github.com/mbostock/ndjson-cli/blob/master/ndjson-join "Source")

[Joins](https://en.wikipedia.org/wiki/Join_\(SQL\)#Inner_join) the two newline-delimited JSON streams in *a-file* and *b-file* according to the specified expressions *a-expression* and *b-expression*. For each JSON object *d* at the zero-based index *i* in the stream *a-file*, the corresponding key is the result of evaluating the *a-expression*. Similarly, for each JSON object *d* at the zero-based index *i* in the stream *b-file*, the corresponding key is the result of evaluating the *b-expression*. When both input streams end, for each distinct key, the cartesian product of corresponding objects *a* and *b* are output as an array `[a, b]`. If *a-expression* is not specified, it defaults to `i`, joining the two streams by line number; in this case, the length of the output stream is the shorter of the two input streams. If *b-expression* is not specified, it defaults to *a-expression*.

For example, consider the CSV file *a.csv*:

```csv
name,color
Fred,red
Alice,green
Bob,blue
```

And *b.csv*:

```csv
name,number
Fred,21
Alice,42
Bob,102
```

To merge these into a single stream by name using [csv2json](https://github.com/d3/d3-dsv/blob/master/README.md#command-line-reference):

```
ndjson-join <(csv2json -n a.csv) <(csv2json -n b.csv) 'd.name'
```

The resulting output is:

```json
[{"name":"Fred","color":"red"},{"name":"Fred","number":"21"}]
[{"name":"Alice","color":"green"},{"name":"Alice","number":"42"}]
[{"name":"Bob","color":"blue"},{"name":"Bob","number":"102"}]
```

To consolidate the results into a single object, use [ndjson-map](#ndjson-map) and [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign):

```
ndjson-join <(csv2json -n a.csv) <(csv2json -n b.csv) 'd.name' | ndjson-map 'Object.assign(d[0], d[1])'
```

<a name="ndjson_sort" href="#ndjson_sort">#</a> <b>ndjson-sort</b> [<i>expression</i>] [<>](https://github.com/mbostock/ndjson-cli/blob/master/ndjson-sort "Source")

Sorts the newline-delimited JSON stream on stdin according to the specified comparator *expression*. After reading the entire input stream, [sorts the array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) of objects with a comparator that evaluates the *expression* for two given JSON objects *a* and *b* from the input stream. If the resulting value is less than 0, then *a* appears before *b* in the output stream; if the value is greater than 0, then *a* appears after *b* in the output stream; any other value means that the partial order of *a* and *b* is undefined. If *expression* is not specified, it defaults to [ascending natural order](https://github.com/d3/d3-array/blob/master/src/ascending.js).

For example, to sort a stream of GeoJSON features by their name property:

```
shp2json -n example.shp | ndjson-sort 'a.properties.name.localeCompare(b.properties.name)'
```

<a name="ndjson_top" href="#ndjson_top">#</a> <b>ndjson-top</b> [<i>expression</i>] [<i>count</i>] [<>](https://github.com/mbostock/ndjson-cli/blob/master/ndjson-top "Source")

Selects the top *count* objects from the newline-delimited JSON stream on stdin according to the specified comparator *expression*. (This [selection algorithm](https://en.wikipedia.org/wiki/Selection_algorithm) is implemented using partial heap sort.) After reading the entire input stream, outputs the top *count* objects in ascending order. As with [ndjson-sort](#ndjson_sort), the input objects are compared by evaluating the *expression* for two given JSON objects *a* and *b* from the input stream. If the resulting value is less than 0, then *a* appears before *b* in the output stream; if the value is greater than 0, then *a* appears after *b* in the output stream; any other value means that the partial order of *a* and *b* is undefined. If *expression* is not specified, it defaults to [ascending natural order](https://github.com/d3/d3-array/blob/master/src/ascending.js). If *count* is not specified, it defaults to 1. If the input stream has fewer than *count* objects, this program is equivalent to [ndjson-sort](#ndjson_sort).

For example, to output the GeoJSON feature with the largest size property:

```
shp2json -n example.shp | ndjson-top 'a.properties.size - b.properties.size'
```

This program is equivalent to `ndjson-sort expression | tail -n count`, except it is much more efficient if *count* is smaller than the size of the input object stream.

## Recipes

To count the number of objects in a stream:

```
shp2json -n example.shp | wc -l
```

To reverse a stream:

```
shp2json -n example.shp | tail -r
```

To take the first 3 objects in a stream:

```
shp2json -n example.shp | head -n 3
```

To take the last 3 objects in a stream:

```
shp2json -n example.shp | tail -n 3
```

To take all but the first 3 objects in a stream:

```
shp2json -n example.shp | tail -n +4
```
