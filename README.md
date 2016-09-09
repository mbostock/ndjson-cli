# ndjson-cli

```
npm install ndjson-cli
```

## ndjson-filter

<a name="ndjson_filter" href="ndjson_filter">#</a> <b>ndjson-filter</b> <i>expression</i>

Filters the newline-delimited JSON stream on stdin according to the specified *expression*: if the *expression* evaluates truthily for the given JSON object *d* at the given zero-based index *i* in the stream, the resulting JSON object is output to stdout; otherwise, it is ignored. This program is much like [*array*.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

For example, given a stream of GeoJSON features from [shp2json](https://github.com/mbostock/shapefile/blob/master/README.md#shp2json), you can filter the stream to include only the multi-polygon features like so:

```
shp2json -n example.shp | ndjson-filter 'd.geometry.type === "MultiPolygon"'
```

Or, to skip every other feature:

```
shp2json -n example.shp | ndjson-filter 'i & 1'
```

Side-effects during filter are allowed. For example, to delete a property:

```
shp2json -n example.shp | ndjson-filter 'delete d.properties.FID, true'
```
