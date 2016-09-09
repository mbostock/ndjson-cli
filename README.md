# ndjson-cli

Unix-y tools for operating on [newline-delimited JSON](http://ndjson.org) streams.

```
npm install ndjson-cli
```

## Command Line Reference

<a name="ndjson_filter" href="ndjson_filter">#</a> <b>ndjson-filter</b> [<i>expression</i>]

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

<a name="ndjson_map" href="ndjson_map">#</a> <b>ndjson-map</b> [<i>expression</i>]

Maps the newline-delimited JSON stream on stdin according to the specified *expression*: outputs the result of evaluating the *expression* for the given JSON object *d* at the given zero-based index *i* in the stream. If *expression* is not specified, it defaults to `d`. This program is much like [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

For example, given a stream of GeoJSON features from [shp2json](https://github.com/mbostock/shapefile/blob/master/README.md#shp2json), you can convert the stream to geometries like so:

```
shp2json -n example.shp | ndjson-map 'd.geometry'
```

<a name="ndjson_reduce" href="ndjson_reduce">#</a> <b>ndjson-reduce</b> [<i>expression</i> [<i>initial</i>]]

Reduces the newline-delimited JSON stream on stdin according to the specified *expression*. For each JSON object in the input stream, evaluates the *expression* for the given JSON object *d* at the given zero-based index *i* in the stream and the previous value *p*, which is initialized to *initial*. If *expression* and *initial* are not specified, they default to `p.push(d), p` and `[]`, respectively, merging all input objects into a single array, like the inverse of [ndjson-split](#ndjson_split). Otherwise, if *initial* is not specified, the first time the *expression* is evaluated *p* will be equal to the first object in the stream (*i* = 0) and *d* will be equal to the second (*i* = 1). Outputs the last result when the stream ends. This program is much like [*array*.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce).

For example, to count the number of objects in a stream of GeoJSON features from [shp2json](https://github.com/mbostock/shapefile/blob/master/README.md#shp2json), like `wc -l`:

```
shp2json -n example.shp | ndjson-reduce 'p + 1' '0'
```

To merge a stream into a feature collection:

```
shp2json -n example.shp | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}'
```

Or to produce an array of features, like the inverse of [ndjson-split](#ndjson_split):

```
shp2json -n example.shp | ndjson-reduce
```

<a name="ndjson_split" href="ndjson_split">#</a> <b>ndjson-split</b> [<i>expression</i>]

Expands the newline-delimited JSON stream on stdin according to the specified *expression*: outputs the results of evaluating the *expression* for the given JSON object *d* at the given zero-based index *i* in the stream. The result of evaluating the *expression* must be an array (though it may be the empty array if no objects should be output for the given input). If *expression* is not specified, it defaults to `d`, which assumes that the input objects are arrays.

For example, given a single GeoJSON feature collection from [shp2json](https://github.com/mbostock/shapefile/blob/master/README.md#shp2json), you can convert a stream of features like so:

```
shp2json example.shp | ndjson-split 'd.features'
```

<a name="ndjson_sort" href="ndjson_sort">#</a> <b>ndjson-sort</b> [<i>expression</i>]

Sorts the newline-delimited JSON stream on stdin according to the specified comparator *expression*. After reading the entire input stream, [sorts the array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) of objects with a comparator that evaluates the *expression* for two given JSON objects *a* and *b* from the input stream. If the resulting value is less than 0, then *a* appears before *b* in the output stream; if the value is greater than 0, then *a* appears after *b* in the output stream; any other value means that the partial order of *a* and *b* is undefined. If *expression* is not specified, it defaults to [ascending natural order](https://github.com/d3/d3-array/blob/master/src/ascending.js).

For example, to sort a stream of GeoJSON features by their name property:

```
shp2json -n example.shp | ndjson-sort 'a.properties.name.localeCompare(b.properties.name)'
```

## Recipes

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
