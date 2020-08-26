// @ts-check

const fs = require("fs");
const path = require("path");

function adaptManifestVersion() {
  const package = require("../package.json");
  const manifest = require("../src/manifest.json");

  let version = package.version;
  manifest.version = version;
  fs.writeFileSync(
    path.join(__dirname, "../src/manifest.json"),
    JSON.stringify(manifest)
  );
}

adaptManifestVersion();
