// @ts-check
const fs = require("fs");
const path = require("path");

function adaptManifestVersion() {
	const packageJson = require(path.resolve(__dirname, "../package.json"));
	const manifest = require(path.resolve(__dirname, "../assets/manifest.json"));

	manifest.version = packageJson.version;
	fs.writeFileSync(path.resolve(__dirname, "../assets/manifest.json"), JSON.stringify(manifest));
}

adaptManifestVersion();
