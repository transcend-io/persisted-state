import { expect } from 'chai';
import { existsSync } from 'fs';
import * as t from 'io-ts';
import { join } from 'path';

import { PersistedState } from '../PersistedState';

describe('PersistedState', () => {
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

  it('should access properties type safely 3 levels deep', () => {
    const twoDeep = state.getValue('type', 'fish');
    const threeDeep = state.getValue('type', 'fish', 'dog');

    expect(twoDeep).to.deep.equal({
      dog: 'dog',
    });
    expect(threeDeep).to.equal('dog');
  });

  it('should set properties type safely 1 level deep', () => {
    state.setValue(3, 'time');
    state.setValue('howdy', 'content');
    expect(state.getValue('content')).to.equal('howdy');
    expect(state.getValue('time')).to.equal(3);
  });

  it('should set properties type safely 2 levels deep', () => {
    state.setValue({ dog: 'moose' }, 'type', 'fish');

    // The following show show a type warning
    // state.setValue({ cow: 'moose' }, 'type', 'fish');

    expect(state.getValue('type', 'fish', 'dog')).to.equal('moose');
  });

  it('should clear the state', () => {
    state.wipe();
    expect(existsSync(testFile)).to.equal(false);
  });
});
