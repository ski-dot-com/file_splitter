import { join_file } from "./lib.mjs"
import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";
import { Blob } from "buffer";
/**
 * @type {Object<string, number>}
 */
var index = JSON.parse(fs.readFileSync(path.join(path.dirname(process.argv[1]), `index.json`)));
for (const fname in index) {
	if (Object.hasOwnProperty.call(index, fname)) {
		const count = index[fname];
		Promise.all(
			[...Array(count)].map((_,i)=>fsp.readFile(path.join(path.dirname(process.argv[1]), `binary/${fname}_segment_${i}.bin`)).then(b=>b.buffer))
		).then(
			(bs)=>new Blob(bs).arrayBuffer()
		).then(
			ab=>fsp.writeFile(path.join(path.dirname(process.argv[1]), `assets/${fname}`), new DataView(ab))
		)
	}
}
