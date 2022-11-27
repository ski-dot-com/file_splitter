import { slice_file, join_file } from "./lib.mjs" 

/**
 * @type {HTMLButtonElement}
 */
var b_split = document.getElementById("b_split");
/**
 * @type {HTMLInputElement}
 */
var natural = document.getElementById("natural");
/**
 * @type {HTMLButtonElement}
 */
var b_join = document.getElementById("b_join");
/**
 * @type {HTMLInputElement}
 */
var sepalated = document.getElementById("sepalated");
/**
 * @type {HTMLInputElement}
 */
var _name = document.getElementById("name");
/**
 * @type {HTMLDivElement}
 */
var split_result = document.getElementById("split_result");
/**
 * @type {HTMLInputElement}
 */
var name_ = document.getElementById("name_");
/**
 * @type {HTMLButtonElement}
 */
var b_load = document.getElementById("b_load");
/**
 * @type {HTMLButtonElement}
 */
var b_play = document.getElementById("b_play");
/**
 * @type {HTMLProgressElement}
 */
var progress = document.getElementById("progress");
/**
 * @type {HTMLLabelElement}
 */
var progress_label = document.getElementById("progress_label");
/**
 * @type {HTMLVideoElement}
 */
var player = document.getElementById("player");
/**
 * @type {HTMLDataListElement}
 */
var name_list = document.getElementById("name_list");
/**
 * @type {Promise<Object<string, number>>}
 */
var index = fetch("index.json").then(res=>res.text()).then(JSON.parse);
b_split.onclick = () => {
	var target = natural.files[0];
	var res = slice_file(target);
	while (split_result.firstChild) {
		split_result.removeChild(split_result.firstChild);
	};
	for (var i = 0; i < res.length; i++) {
		var a_dl = document.createElement("a");
		a_dl.textContent = a_dl.download = `${target.name}_segment_${i}.bin`;
		a_dl.href = URL.createObjectURL(res[i]);
		split_result.appendChild(a_dl);
		split_result.appendChild(document.createElement("br"));
	}
}
b_join.onclick = () => {
	/**
	 * @type {File[]}
	 */
	var segments = Array(sepalated.files.length);
	var pref_length = _name.value.length + 9;
	for (i = 0; i < sepalated.files.length; i++) {
		segments[+(sepalated.files[i].name.slice(pref_length, -4))] = sepalated.files[i];
	}
	var res = join_file(segments);
	var a_dl = document.createElement("a");
	a_dl.download = _name.value
	a_dl.href = URL.createObjectURL(res);
	a_dl.click();
	a_dl.remove();
}
index.then(index=>{
	for (const name in index) {
		if (Object.hasOwnProperty.call(index, name)) {
			const count = index[name];
			var tmp = document.createElement("option");
			tmp.value = name;
			name_list.appendChild(tmp);
		}
	}
	b_load.onclick = () => {
		progress.max=index[name_.value];
		progress.value=0;
		function update(){
			progress_label.textContent = `進捗状況: ${progress.value} / ${progress.max}`
		}
		/**
		 * timeで最大試行回数を決めれるfetch。
		 * @param {URL} path アクセスするファイル
		 * @param {number} times 最大試行回数
		 * @returns {Promise<Response>} 結果
		 */
		async function try_fetch_blob(path, times) {
			times--;
			try{
				console.log(`read ${path}... ${times} try are left.`)
				var res = await (fetch(path).then(res=>res.blob()));
				console.log(`successfully read ${path}.`)
				return res;
			}catch(e){
				if(times > 0){
					console.log(`error occured in accessing ${path}: 
${e}
try again.`);
					return await try_fetch_blob(path, times);
				}else{
					console.log(`error occured in accessing ${path}.
${e}`);
					throw e;
				}
			}
		}
		var segments = [...Array(index[name_.value])]
		.map((_,i)=>try_fetch_blob(`binary/${name_.value}_segment_${i}.bin`, 50)
		.then(b=>{
			progress.value++;
			update();
			return b;
		})
		);
		Promise.all(segments).then(segments=>{
			var res = join_file(segments);
			var a_dl = document.createElement("a");
			a_dl.download = name_.value
			a_dl.href = URL.createObjectURL(res);
			a_dl.click();
			a_dl.remove();
			a_dl.onclick=ev=>{
				URL.revokeObjectURL(a_dl.download);
			};
			progress_label.textContent = `進捗状況:`;
		}).catch((e)=>{
			progress_label.textContent = `進捗状況:`;
			alert("エラーが発生しました。")
			throw e;
		}
		);
	}
	b_play.onclick = () => {
		progress.max=index[name_.value];
		progress.value=0;
		function update(){
			progress_label.textContent = `進捗状況: ${progress.value} / ${progress.max}`
		}
		/**
		 * timeで最大試行回数を決めれるfetch。
		 * @param {URL} path アクセスするファイル
		 * @param {number} times 最大試行回数
		 * @returns {Promise<Response>} 結果
		 */
		async function try_fetch_blob(path, times) {
			times--;
			try{
				console.log(`read ${path}... ${times} try are left.`)
				var res = await (fetch(path).then(res=>res.blob()));
				console.log(`successfully read ${path}.`)
				return res;
			}catch(e){
				if(times > 0){
					console.log(`error occured in accessing ${path}: 
${e}
try again.`);
					return await try_fetch_blob(path, times);
				}else{
					console.log(`error occured in accessing ${path}.
${e}`);
					throw e;
				}
			}
		}
		var segments = [...Array(index[name_.value])]
		.map((_,i)=>try_fetch_blob(`binary/${name_.value}_segment_${i}.bin`, 50)
		.then(b=>{
			progress.value++;
			update();
			return b;
		})
		);
		Promise.all(segments).then(segments=>{
			var res = join_file(segments);
			player.src = URL.createObjectURL(res);
			player.load();
			progress_label.textContent = `進捗状況:`;
		}).catch((e)=>{
			progress_label.textContent = `進捗状況:`;
			alert("エラーが発生しました。")
			//window.location.reload()
			throw e;
		}
		);
	}
})
