#!/usr/bin/env node

import sade from "sade"
import handler from "./handler.js"

sade("ncu [dir]")
	.describe("check and update outdated dependencies in your package.json")
	.option("--semver", "respect semantic versioning")
	.option("-u, --update", "update the package.json file")
	.option("-i, --install", "automatically install update [only with update]")
	.action(handler)
	.parse(process.argv)
