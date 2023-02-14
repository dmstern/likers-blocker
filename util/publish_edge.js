import { EdgeAddonsAPI } from "@plasmohq/edge-addons-api";
import process from "node:process";
import * as dotenv from "dotenv";
dotenv.config();

const client = new EdgeAddonsAPI({
	productId: "874e30c9-90ca-49ce-85df-123935a3ba90",
	clientId: process.env.EDGEclientId,
	clientSecret: process.env.EDGEclientSecret,
	accessTokenUrl: process.env.EDGEaccessTokenUrl
});

await client.submit({
	filePath: "likers-blocker_chromium.zip",
	notes: "Developer notes"
});