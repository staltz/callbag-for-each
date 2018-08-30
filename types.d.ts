import { Source } from 'callbag'

export default function forEach<T>(operation: (data: T) => void): (source: Source<T>) => void;
