# ui-library
A basic collection UI CSS components to kick out a project quickly. The idea is
to provide css components separeted as modules (currently written using LESS)
(so you can include which components to include), no JS depencies (you can
choose whatever framework/library to wrap them as widgets if you wish, is up to
you, it only provides the basic visuals, giving you full control over the your
application).

The library provides uncompiled `less` files, you will need a strategy
to compile them and use it on your projects. You can check the
[examples folder](https://github.com/noeldelado/ui-library/tree/master/examples)
to help you get started.

**Note:** I build this to kick off my own projects, the reason I decided to
build a new set of components was to have full control over the stuff I wanted/
needed.

## Install
This library is available as a [github repository](https://github.com/noeldelgado/ui-library "ui-library repo").

You can install it by cloning the repo, via bower or including it as a
dependency on your `package.json`.

### Via npm
```
npm install ui-library --save
```

### Using bower
````
bower install ui-library
````

### Cloning the repo
```
git clone git@github.com:noeldelgado/ui-library.git
```

## Customization
The CSS Framework is written in [LESS](http://lesscss.org/). The styles are
separated into multiple files, so you can choose which bits to load:

- src/less/core/variables.less
- src/less/core/utilities.less
- src/less/core/reset.less
- src/less/core/font.less

- src/less/components.less (all components)

In order to override any variable without having to modify ui-library, you can
do the following:

```
@ui-path: "<path-to-repo>/ui-library/src/less";

@import "@{ui-path}/core/variables";
@import "@{ui-path}/core/utilities";
@import "@{ui-path}/core/reset";
@import "@{ui-path}/core/font";

/* override ui-library variables */
@base-font-family: 'Inconsolata', 'Monaco', monospace;
@base-font-size: 14px;
@base-line-height: 1.618em;
@primary-color: rgb(255, 36, 105);

// ui-library components
@import "@{ui-path}/components";
```

## Run the examples
```
npm install
cd examples/<example-folder>
npm install
# run task manager, usually grunt or gulp
```
