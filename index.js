const chokidar = require('chokidar');
const path     = require('path');
const Minio    = require('minio');
const fs       = require('fs');
const mime     = require('mime-types');
const mailer   = require('./mailer.js');
const chalk    = require('chalk');

require('dotenv').config();

// Directory to watch
// Change This to Ur Own Folder
const dirToWatch = path.join(__dirname, 'watched-directory');

// Initialize watcher
const watcher = chokidar.watch(dirToWatch, {
    persistent: true,
    ignoreInitial: false, // False to Monitor changes even to existing files
    depth: 99, // Recursively watch all subdirectories
});

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_HOST,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS,
secretKey: process.env.MINIO_SECRET,
region: process.env.MINIO_REGION,
});

const uploadFile = async (file) => {

	let extension = file.split('.').pop()
	let contentType = mime.contentType(extension);

	let metaData = {
		'Content-Type': contentType
	};

	try {
		await minioClient.putObject(process.env.MINIO_BUCKET, file.replace(__dirname, ''), fs.readFileSync(file), metaData)

    console.log(chalk.greenBright(`[+] File uploaded: ${file}`));
	} catch (e) {
    console.log(chalk.red(`[-] File upload error: ${e.stack}`));
    mailer.notifyMe(JSON.stringify({
      file,
      stack: e.stack
    }))
	}

}

// Event listener for when files are added or changed
watcher.on('add', filePath => {
    uploadFile(filePath)
    console.log(`File added: ${filePath.replace(__dirname, '')}`);
}).on('change', filePath => {
    console.log(`File changed: ${filePath}`);
}).on('unlink', filePath => {
    console.log(`File removed: ${filePath}`);
}).on('error', error => {
    console.error(`Watcher error: ${error}`);
});

console.log(`Monitoring changes in directory: ${dirToWatch}`);