// @ts-check
import archiver from "archiver";
import { createWriteStream } from "fs";

// create a file to stream archive data to.
function createZip(target, src, isSingleFile) {
	const output = createWriteStream(target);
	const archive = archiver("zip", {
		zlib: { level: 9 }, // Sets the compression level.
	});

	// listen for all archive data to be written
	// 'close' event is fired only when a file descriptor is involved
	output.on("close", function () {
		console.log(`${archive.pointer()} total bytes`);
		console.log("archiver has been finalized and the output file descriptor has closed.");
	});

	// good practice to catch this error explicitly
	archive.on("error", function (err) {
		throw err;
	});

	// pipe archive data to the file
	archive.pipe(output);

	if (isSingleFile) {
		archive.file(src, { name: "src.ts" });
	} else {
		// append files from a sub-directory, putting its contents at the root of archive
		archive.directory(src, false);
	}

	// finalize the archive (ie we are done appending files but streams have to finish yet)
	// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
	archive.finalize();
}

createZip("likers-blocker.zip", "dist/", false);
createZip("likers-blocker_chromium.zip", "dist_chrome/", false);
createZip("src.zip", "src", false);
