<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

## Table of Contents

- [Overview](#overview)
- [Typescript Build](#typescript-build)
- [Lint](#lint)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

This package contains a class that makes it easy to read/write JSON data from a file on disk. It's built using io-ts to provide runtime and static type validation.

## Example

```ts
// A sample io-ts validation
const TestCodec = t.type({
  timestamp: t.string,
  time: t.number,
  type: t.type({
    fish: t.partial({
      dog: t.string,
    }),
  }),
  content: t.string,
});

// Create a new state before each test
const testFile = join(__dirname, 'test.json');
const state = new PersistedState(testFile, TestCodec, {
  timestamp: '',
  time: 2,
  type: {
    fish: {
      dog: 'dog',
    },
  },
  content: '',
});

// get values
const twoDeep = state.getValue('type', 'fish'); // { dog: 'dog' }
const threeDeep = state.getValue('type', 'fish', 'dog'); // 'dog'

// set values
state.setValue(3, 'time');
state.setValue('howdy', 'content');
state.setValue({ dog: 'moose' }, 'type', 'fish');

// save and wipe
state.save();
state.wipe();
```

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
