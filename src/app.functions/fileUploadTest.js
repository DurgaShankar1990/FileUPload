const FileAPI = require("file-api");
const atob = require("atob");
const Blob = require("node-blob");
const FormData = require("form-data");
const axios = require('axios').default;

const File = FileAPI.File;
const URL = `https://api.hubapi.com/files/v3/files`;
const ACCESS_TOKEN = ACCESS_TOKEN;

exports.main = async (context, sendResponse) => {
	let folderId = "49857623460";
	let dataURL = context.body.imgData;
	let fileName = context.body.fileName;
	let form = new FormData();
	let blob = dataURItoBlob(dataURL);

	function dataURItoBlob(dataURI) {
		// convert base64 to raw binary data held in a string
		// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
		var byteString = atob(dataURI.split(",")[1]);

		// separate out the mime component
		var mimeString = dataURI
			.split(",")[0]
			.split(":")[1]
			.split(";")[0];

		// write the bytes of the string to an ArrayBuffer
		var ab = new ArrayBuffer(byteString.length);

		// create a view into the buffer
		var ia = new Uint8Array(ab);

		// set the bytes of the buffer to the correct values
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		// write the ArrayBuffer to a blob, and you're done
		var blob = new Blob([ab], { type: mimeString });
		return blob;
	}
	const blobFile = new File({
		type: blob.type,
		buffer: blob.buffer,
		name: fileName,
	});
	
	form.append("file", blob.buffer, fileName);
	form.append("folderId", folderId);
	form.append("options",'{\n  "access":  "PUBLIC_INDEXABLE",\n"overwrite": true,\n"duplicateValidationStrategy": "RETURN_EXISTING",\n"duplicateValidationScope": "EXACT_FOLDER"\n}');
	
	const HEADERS = Object.assign({
		'Authorization': `Bearer ${ACCESS_TOKEN}`
	}, form.getHeaders());

	axios.post(URL, form, {
		headers: HEADERS,
	}).then(function(response) {
		console.log("exe")
		sendResponse({ body: { response: response.data},statusCode: 200 });
	}).catch(function(error) {
		console.log(JSON.stringify(error))
		sendResponse({body: {error: error.message},statusCode: 500});
	});
};
