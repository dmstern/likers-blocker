// @ts-check
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function adaptManifestVersion() {
	const packageJsonFile = fs.readFileSync(path.resolve(__dirname, "../package.json"));
	const manifestFile = fs.readFileSync(path.resolve(__dirname, "../assets/manifest.json"));
	const packageJson = JSON.parse(packageJsonFile.toString());
	const manifest = JSON.parse(manifestFile.toString());

	manifest.version = packageJson.version;
	fs.writeFileSync(
		path.resolve(__dirname, "../assets/manifest.json"),
		JSON.stringify(manifest, null, "\t")
	);
}

adaptManifestVersion();
