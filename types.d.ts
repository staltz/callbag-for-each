import { Source } from 'callbag'
declare function forEach<T>(operation: (data: T) => void): (source: Source<T>) => void;
export = forEach;
