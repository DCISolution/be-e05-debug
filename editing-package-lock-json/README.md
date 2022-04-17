# Duplicate Dependencies

The standard version of the `debug` demo app allows you to use the endpoint [/debug-set/app:*](http://localhost:3001/debug-set/app:*), or similar, to set which of your custom namespaces are enabled.

However, if you try using a namespace parameter like [/debug-set/app:*,express:*](http://localhost:3001/debug-set/app:*,express:*), nothing happens. The `express:*` namespace is not enabled.

To understand why, `cd` into the directory that contains the standard version of the `debug` demo app and run the command `npm list debug` in the Terminal. You should see something like:
```bash
npm list debug
debug@1.0.0 /path/to/be-e05-debug
├── debug@4.3.4
├─┬ express@4.17.3
│ ├─┬ body-parser@1.19.2
│ │ └── debug@2.6.9
│ ├── debug@2.6.9
│ ├─┬ finalhandler@1.1.2
│ │ └── debug@2.6.9
│ └─┬ send@0.17.2
│   └── debug@2.6.9
└─┬ nodemon@2.0.15
  └── debug@3.2.7
```

Notice how many different versions of the `debug` module are listed, and in how many different places.

The `debug.js` script is using the version listed first: `debug@4.3.4`. Express, on the other hand, is using its own, earlier version: `debug@2.6.9`. The commands that you send to the `debug@4.3.4` are never heard by the version that express is running.

In most cases, this is not going to bother you. You can trust the developers of Express, and you don't need to log any debug infor for Express to the Console. You are only concerned with controlling your own `debug` namespaces.

So you can stop reading here.

The important thing to note is that the structure of the `node_modules` directory may contain redundant files, because modules are designed to be independent. They don't need to know about each others' requirements. 

---

## Why Are There Duplicates?

Modules often depend on other modules. When a development team releases a new version, they ensure that the dependencies for their module are bundled with it. Each module has its own `package.json` file which describes its dependencies.

Occasionally, a team will release a version of their module which has _breaking changes_. It is good practice to make each version _backwards compatible_ with earlier versions, but sometimes (to fix a bug, to include a cool new feature, ...), the new version will not give the same output for the same input as the previous version did.

When this happens, the new version is considered a _major release_, and the first part of its version number is incremented. (See [Semantic Versioning]([wikipedia](https://en.wikipedia.org/wiki/Software_versioning#Semantic_versioning)).)

For example, `debug v2.6.9` was followed by `debug v3.0.0`. As the team fixed bugs, optimized the code and added minor new features, _minor releases_ (like v3.1.0) and _patches_ (like v3.1.1) were periodically released. And then `debug v3.2.7` was followed by `debug 4.0.0`, in another major update.

As far as Express is concerned, `debug v2.6.9` has all the features that are necessary. The Express development team has not yet felt that it is a priority to update the version of `debug` that is required. Updating would mean spending time checking that the breaking changes in `debug v4.x.x` do not break Express. And that time could be spent better on other things.

As a result, the `node_modules` directory needs to contain several different versions of certain modules.

## A Safely Forced Update

By default, the `debug` feature for every node module is turned off. You need to explicitly enable the namespaces whose output you want to see in the Console.

This means that its much safer to force a module to use a newer version of `debug` than it is with most other dependencies. You will never see a problem unless you explicitly enable a namespace in a third-party module, and you can make immediately stop the problem from occurring by disabling the namespace again; you won't lose any of the functionality of the third-party module.

## Moving Up The Hierachy

When a module `require`s a dependent module, it will look first for the dependency in its own directory. If it doesn't find it there, it will look in its parent directory, and keep on moving up the directory hierarchy until it reaches the `node_modules` directory itself.

This means that it is possible to _flatten_ the structure of the `node_modules` directory. Instead of each module keeping its dependencies nested inside its _own_ directory, all dependencies for all modules can be placed at the _root_ of the `node_modules` directory.

This explains why, when you add just one dependency to your `package.json` file, you are quite likely to find a large quantity of package directories filling the `node_modules` directory.

## Deduplicating Your Dependencies

Because the `debug` module was explicitly installed using `npm install debug`, the latest version of `debug` was added at the root of the `node_modules` directory. In order to get the modules that use `debug` as a dependency to use this latest version, you'll need to do two things:

1. Update their local `package.json` files, to tell them to use the latest version
2. Remove the older version of `debug` that they have nested in their own directories.

There are two ways to do this: semi-automatically and manually.

### Semi-automatic: yarn install --flat

Yarn is a recent alternative to NPM, and it provides a way of forcing a flattened installation of dependencies.

**One word of caution: this solution cannot be used just for `debug`. It will flatten _all_ the dependencies, and may force you to choose versions of modules which create incompatibilities and errors.**

Follow [these instructions](https://yarnpkg.com/getting-started/install) to install `yarn`.

In the folder `done-yarn-flat`, you will find an app which has already been installed using `yarn install --flat`.

You can test this for yourself using the `todo-yarn-flat` folder. Each time multiple versions of the same module are requested, `yarn` will ask you which one you want to use:

```bash
yarn install --flat
yarn install v1.22.18
info No lockfile found.
[1/4] 🔍  Resolving packages...
info Unable to find a suitable version for "debug", please choose one by typing one of the numbers below:
  1) "debug@^4.3.4" which resolved to "4.3.4"
  2) "debug@2.6.9, debug@2.6.9, debug@2.6.9, debug@2.6.9" which resolved to "2.6.9"
  3) "debug@^3.2.7" which resolved to "3.2.7"
Answer?: 
```
Entering the number `1` here means that only `debug@4.3.4` will be installed.

After all the choices have been made, `yarn` will add a new entry to the `package.json` file, indicating these choices:

```json
  ,
  "resolutions": {
    "debug": "4.3.4",
    "ms": "2.1.3",
    "semver": "7.3.7",
    "supports-color": "7.2.0",
    "has-flag": "4.0.0",
    "ini": "2.0.0",
    "get-stream": "5.2.0",
    "lowercase-keys": "2.0.0"
  }
```

As you can see, `debug` was not the only duplicate module.

### Manual

If you just want to ensure that all modules use `debug v4.3.4`, without updating any of the other dependencies, then you can do this manually, and without installing `yarn'.

1. Open the `todo-manual-deduplication` directory in VS Code
2. Open a Terminal pane
3. Run `npm install`. This will create a standard nested `node_modules` directory and a `package-lock.json` file.
4. Use `npm list debug` to find all the places where the `debug` module is installed:
  ```bash
  npm list debug
  debug@1.0.0 /path/to/todo-manual-deduplication
  ├── debug@4.3.4
  ├─┬ express@4.17.3
  │ ├─┬ body-parser@1.19.2
  │ │ └── debug@2.6.9
  │ ├── debug@2.6.9
  │ ├─┬ finalhandler@1.1.2
  │ │ └── debug@2.6.9
  │ └─┬ send@0.17.2
  │   └── debug@2.6.9
  └─┬ nodemon@2.0.15
    └── debug@3.2.7
  ```
5. In the `node_modules` directory, open each of the sub-directories for the modules that use `debug`:
   * body-parser
   * express
   * finalhandler
   * nodemon
   * send
6. In each of these five sub-directories:
   * Open the `node_modules` directory
   * Delete the `debug` directory within it
7. In `package-lock.json` at the project root:
   * Look for objects with keys like "node_modules/.../debug"
   * (You can find these by searching for the regular expression `,\s+"node_modules/.+/debug": \{\n(((?!\},).)*\s)+\}`)
   * Delete them. Just go ahead and delete them.
   * +
   * Look for all lines like `        "debug": "2.6.9",` or `        "debug": "^3.2.7",`
   * Replace them with `        "debug": "^4.3.4",`
   * (Replace all occurrences of the regular expression `^(\s+"debug": )"\^?\d+\.\d+\.\d+",` with `$1"^4.3.4",`)

### Reviewing the Flattened Packages

Run `npm list debug` again. It should look like this now:
   ```
    npm list debug
debug@1.0.0 /path/to/todo-manual-deduplication
├── debug@4.3.4
├─┬ express@4.17.3
│ ├─┬ body-parser@1.19.2
│ │ └── debug@4.3.4 deduped invalid: "2.6.9" from node_modules/express, "^3.2.7" from node_modules/nodemon, "2.6.9" from node_modules/body-parser
│ ├── debug@4.3.4 deduped invalid: "2.6.9" from node_modules/express
│ ├─┬ finalhandler@1.1.2
│ │ └── debug@4.3.4 deduped invalid: "2.6.9" from node_modules/express, "^3.2.7" from node_modules/nodemon, "2.6.9" from node_modules/body-parser, "2.6.9" from node_modules/finalhandler
│ └─┬ send@0.17.2
│   └── debug@4.3.4 deduped invalid: "2.6.9" from node_modules/express, "^3.2.7" from node_modules/nodemon, "2.6.9" from node_modules/body-parser, "2.6.9" from node_modules/finalhandler, "2.6.9" from node_modules/send
└─┬ nodemon@2.0.15
  └── debug@4.3.4 deduped invalid: "2.6.9" from node_modules/express, "^3.2.7" from node_modules/nodemon

npm ERR! code ELSPROBLEMS
npm ERR! invalid: debug@4.3.4 /path/to/todo-manual-deduplication/node_modules/debug

npm ERR! A complete log of this run can be found in:
npm ERR!     /path/to/.npm/_logs/<date>-debug.log
```

There are so many warnings! And all in red!

This is because the individual `package.json` files in each module directory where you deleted a duplicate `debug` module is expecting to find an older version of `debug`... and is finding only the most recent version instead.

The important word to note is "deduped" (short for de-duplicated). All mentions of `│ │ └── debug@4.3.4 deduped` now point to the version listed first.

The warnings are there to help you troubleshoot any problems that might arise in your installation. But since you know exactly what they are referring to, they are a sign that you achieved what you intended to do.

### package-lock.json

For your current custom installation, it would have been enough just to remove all the duplicate `debug` directories nested inside other modules. But if you want other people to work on your app, using a copy of your repository, it is important that they, too have exactly the same installation in the `node_modules` directory.

The `package.json` file describes the dependencies that your project _wants_ to install. The `package-lock.json` file describes the exact dependencies _has installed_. By including your `package-lock.json` file in your Git repository, you can sure that your colleagues will get _exactly the same_ versions of each module when they run `npm install` after cloning your repository.

You can check that this is true. Delete your `node_modules` folder an run `npm install` followed by `npm list debug`. You should see exactly the same output: `debug@4.3.4 deduped` should appear everywhere, followed by the thrilling red warnings.

Check in each of the following sub-directories of the root `node_modules` directory, that the `debug` module has not been reinstalled in a nested `node_modules` folder there. In most cases, the nested `node_modules` folder will have gone, because of the process of flattening.
* body-parser
* express
* finalhandler
* nodemon
* send

And yes, you might have to reassure your colleagues that those warnings are not dangerous. You simply hand-crafted the `package-lock.json` file, but you know what you are doing. You rule!

### Testing the Optimized Packages

Run `npm start`. You should see output like this:
```bash
$ npm start

> debug@1.0.0 start
> nodemon barebones.js

[nodemon] 2.0.15
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node barebones.js`
Visit http://localhost:3333/debug-set/app:*,express:*
```
Press the Ctrl key and click on the link. A window in your default browser should open, and the following lines should appear in your Console:
```
  app:one localhost:3333/debug-set/app:*,express:* +0ms
  app:two {"x-powered-by":"Express"} +0ms
```
Refresh the page. This time, you should see:
```
  express:router dispatching GET /favicon.ico +0ms
  express:router query  : /favicon.ico +0ms
  express:router expressInit  : /favicon.ico +0ms
  app:one localhost:3333/debug-set/app:*,express:* +0ms
  app:two {"x-powered-by":"Express"} +0ms
```
Notice that the `express:router` namespace has been activated! The first time the page was shown, the line `debug.enable(namespaces)` enabled the `express:*` namespaces, but these were not yet activated when the code in the `express` module were executed. The second time you requested the page, the `express:router` debug namespace was ready to print to the Console.

In your browser, if you change the URL to `http://localhost:3333/debug-set/app:two`, the `app:one` and `express:*` namespaces will be disabled. The `express:router` entries will have been displayed before the namespace was disabled, but output for `app:one` will appear. If you refresh your browser page, only the `app:two` output will show in the Console.

## What You Should Remember

When you ran the standard version of the `debug` demo app, you were only able to switch on and off the custom namespaces that are defined in the `debug.js` file. From the browser, you had no control over namespaces created by other modules.

You used `npm list debug` to discover that many copies of the `debug` module were stored in many different places in the `node_modules` directory, and understood that the script in `debug.js` only had access to one of these copies.

This duplication is a side-effect of the modular development process. It guarantees that each module works independently, each with its own nest of dependencies.

In most cases, this is all for the best.

In the specific case of the `debug` module — in the _very_ specific case of using an Express endpoint to switch `debug` module namespaces on and off — it makes sense to force all modules that use the `debug` dependency to use the same copy of the same version, and to remove all duplicates.

You saw that using `yarn install --flat` is one way to remove duplicate modules, but that it could possibly lead to incompatibilities if there have been breaking changes in an updated dependency.

You saw how to edit the `package-lock.json` file manually, in order to force `npm install` to use a specific version of a dependency, and to make sure that each package that requires that dependency uses that exact version.

And finally, you tested a barebones version of the `debug` demo app, to discover that the changes you had made in `package-lock.json` had increased the power of the app.

But most of all you learnt that the _process of learning_ works best when you take something apart and rebuild it differently. Successfully following a tutorial is not learning. Daring to break something and then mending it engages your emotions, and emotions are what your memories are built on.

If you never again use the `debug` module or you never again edit a `package-lock.json`, remember the process: take things apart and rebuild them differently. Take the risk of making mistakes, so that you have something you made yourself to learn from.