import { slice_file } from "./lib.mjs"
import * as fs from "fs";
import * as path from "path";
import { Blob } from "buffer";
var res = slice_file(new Blob([fs.readFileSync(path.join(path.dirname(process.argv[1]), "raw/",process.argv[2])).buffer]));
if (res.length != 0) {
    // res[0].arrayBuffer().then(
    //     (val)=>{
    //         fs.writeFileSync(
    //             path.join(path.dirname(process.argv[1]),`binary/${path.basename(process.argv[2])}_segment_master_${res.length}.bin`),
    //             new DataView(val)
    //         );
    //     }
    // )
    // for(var i = 1; i<res.length; i++){
    //     res[i].arrayBuffer().then(
    //         (val)=>{
    //             fs.writeFileSync(
    //                 path.join(path.dirname(process.argv[1]),`binary/${path.basename(process.argv[2])}_segment_slave_${i}.bin`),
    //                 new DataView(val)
    //             );
    //         }
    //     )
    // }
    for (var i = 0; i < res.length; i++) {
        ((i) => {
            res[i].arrayBuffer().then(
                (val) => {
                    fs.writeFileSync(
                        path.join(path.dirname(process.argv[1]), `binary/${path.basename(process.argv[2])}_segment_${i}.bin`),
                        new DataView(val)
                    );
                }
            )
        })(i);
    }
}
/**
 * @type {Object<string, {type: "video", codec: }>}
 */
var index = JSON.parse(fs.readFileSync(path.join(path.dirname(process.argv[1]), `index.json`)));
index[path.basename(process.argv[2])] = res.length;
fs.writeFileSync(path.join(path.dirname(process.argv[1]), `index.json`), JSON.stringify(index));
