<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

## Table of Contents

- [Overview](#overview)
- [Typescript Build](#typescript-build)
- [Lint](#lint)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

This package contains a class that makes it easy to read/write JSON data from a file on disk. It's built using io-ts to provide runtime and static type validation.

## Typescript Build

Build this package only:

```sh
yarn run tsc
yarn run tsc --watch # Watch mode
```

Create a fresh build:

```sh
yarn clean && yarn run tsc
```

## Lint

Lint the typescript files in this package:

```sh
yarn lint
```
