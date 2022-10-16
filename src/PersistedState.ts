import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import * as t from 'io-ts';
import { dirname } from 'path';
import mkdirp from 'mkdirp';
import { decodeCodec } from '@transcend-io/type-utils';

/**
 * The value of T[S], if it's not null/undefined
 *
 * @see https://github.com/pimterry/typesafe-get/blob/master/index.ts
 */
export type Prop<T, S extends keyof T> = NonNullable<T[S]>;

/**
 * A simple storage utility for persisting state to a JSON file for reload upon
 * repeated runs of the same application.
 *
 * Use io-ts to validate the shape of the state
 */
export class PersistedState<TStateCodec extends t.Any> {
  /** The configuration that is persisted to file for server restarts */
  public state: t.TypeOf<TStateCodec>;

  /**
   * Create a new release
   *
   * @param saveStatePath - The path to the env file that persists what step of deploy we are on
   * @param stateCodec - The codec to validate the store shape
   * @param defaultState - The default state when initializing for the first time
   */
  constructor(
    private saveStatePath: string,
    private stateCodec: TStateCodec,
    defaultState: t.TypeOf<TStateCodec>,
  ) {
    // Read in the state from file
    this.state = existsSync(saveStatePath)
      ? decodeCodec(stateCodec, readFileSync(saveStatePath, 'utf-8'))
      : defaultState;
  }

  // /////////////// //
  // File Management //
  // /////////////// //

  /**
   * Write the state to file to be later re-loaded
   */
  public save(): void {
    // Validate before save
    decodeCodec(this.stateCodec, this.state);

    // Ensure the path exists
    mkdirp.sync(dirname(this.saveStatePath));

    // Save to file
    writeFileSync(this.saveStatePath, JSON.stringify(this.state, null, 2));
  }

  /**
   * Wipe the storage file
   */
  public wipe(): void {
    unlinkSync(this.saveStatePath);
  }

  // //////////////// //
  // Type safe get in //
  // //////////////// //

  /**
   * Get 3 levels deep -- you get the gist, if you need more duplicate this logic
   */
  public getValue<
    TKey1 extends keyof NonNullable<t.TypeOf<TStateCodec>>,
    TKey2 extends keyof Prop<NonNullable<t.TypeOf<TStateCodec>>, TKey1>,
    TKey3 extends keyof Prop<
      Prop<NonNullable<t.TypeOf<TStateCodec>>, TKey1>,
      TKey2
    >,
  >(
    k1: TKey1,
    k2: TKey2,
    k3: TKey3,
  ): Prop<Prop<NonNullable<t.TypeOf<TStateCodec>>, TKey1>, TKey2>[TKey3];

  /**
   * Get 2 levels deep
   */
  public getValue<
    TKey1 extends keyof NonNullable<t.TypeOf<TStateCodec>>,
    TKey2 extends keyof Prop<NonNullable<t.TypeOf<TStateCodec>>, TKey1>,
  >(
    k1: TKey1,
    k2: TKey2,
  ): Prop<NonNullable<t.TypeOf<TStateCodec>>, TKey1>[TKey2];

  /**
   * Get 1 level deep
   */
  public getValue<TKey1 extends keyof NonNullable<t.TypeOf<TStateCodec>>>(
    k1: TKey1,
  ): t.TypeOf<TStateCodec>[TKey1];

  /**
   * Fetch a value form the release state
   *
   * @param props - Grab deeply nested values
   * @returns The value of the state param
   */
  public getValue(
    ...props: string[]
  ):
    | any /* eslint-disable-line @typescript-eslint/no-explicit-any */
    | undefined {
    let value = this.state;

    props.forEach((prop) => {
      // skip if no value
      if (value === null || value === undefined) {
        return;
      }

      // Grab next value
      value = value[prop];
    });

    return value;
  }

  /**
   * Set 3 level deep -- you get the gist, if you need more duplicate this logic
   */
  public setValue<
    TKey1 extends keyof NonNullable<t.TypeOf<TStateCodec>>,
    TKey2 extends keyof Prop<NonNullable<t.TypeOf<TStateCodec>>, TKey1>,
    TKey3 extends keyof Prop<
      Prop<NonNullable<t.TypeOf<TStateCodec>>, TKey1>,
      TKey2
    >,
  >(
    valueToSet: Prop<
      Prop<NonNullable<t.TypeOf<TStateCodec>>, TKey1>,
      TKey2
    >[TKey3],
    k1: TKey1,
    k2: TKey2,
    k3: TKey3,
  ): Promise<void>;

  /**
   * Set 2 level deep
   */
  public setValue<
    TKey1 extends keyof NonNullable<t.TypeOf<TStateCodec>>,
    TKey2 extends keyof Prop<NonNullable<t.TypeOf<TStateCodec>>, TKey1>,
  >(
    valueToSet: Prop<NonNullable<t.TypeOf<TStateCodec>>, TKey1>[TKey2],
    k1: TKey1,
    k2: TKey2,
  ): Promise<void>;

  /**
   * Set 1 level deep
   */
  public setValue<TKey1 extends keyof NonNullable<t.TypeOf<TStateCodec>>>(
    valueToSet: t.TypeOf<TStateCodec>[TKey1],
    k1: TKey1,
  ): Promise<void>;

  /**
   * Set the value of a parameter on a certain step
   *
   * @param valueToSet - The value to set (if a list, can be a single list item)
   * @param props - Set deeply nested values
   */
  public async setValue(
    valueToSet: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    ...props: string[]
  ): Promise<void> {
    // Start at base
    let value = this.state;

    // Iterate over each prop
    props.forEach((prop, ind) => {
      // If the last item, set it
      if (ind === props.length - 1) {
        value[prop] = valueToSet;
      } else {
        // Else nest deeper
        value = value[prop];
      }

      // If path is detected wrong, throw an error
      if (!value) {
        throw new Error(
          `Invalid state path: "${props.slice(0, ind + 1).join('.')}"`,
        );
      }
    });

    // Persist to store
    await this.save();
  }
}
