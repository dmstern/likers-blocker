// @ts-check

const fs = require("fs");
const path = require("path");

function adaptManifestVersion() {
  const package = require(path.resolve(__dirname, "../package.json"));
  const manifest = require(path.resolve(__dirname, "../assets/manifest.json"));

  let version = package.version;
  manifest.version = version;
  fs.writeFileSync(
    path.resolve(__dirname, "../assets/manifest.json"),
    JSON.stringify(manifest)
  );
}

adaptManifestVersion();
