# @m4rch/npm-check-updates

a low-dependency quick tool to update all the dependecies in your package.json

# use

## cli

```
$ ncu --help

  Description
    check and update outdated dependencies in your package.json

  Usage
    $ ncu [dir] [options]

  Options
    --semver         respect semantic versioning
    -u, --update     update the package.json file
    -i, --install    automatically install update [only with --update]
    -v, --version    Displays current version
    -h, --help       Displays this message
```

## api

```js
import ncu from "@m4rch/npm-check-updates"
```

`ncu` takes 2 arguments

```ts
function ncu ( pkg: pkg, options?: options ): Promise<deps>

interface pkg {
	[ key: string ]: string | number | boolean | null | pkg
}

interface options {
	semver?: boolean
}

type deps = dep[]

interface dep {
	name: string, // name of module
	from: "dependency" | "devDependency",
	old: string,  // old version
	new: string   // new version
}
```

### handler

```js
import handler from "@m4rch/npm-check-updates/handler"
```
