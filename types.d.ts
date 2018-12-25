import { Source } from 'callbag'
declare const forEach: (operation: (data: any) => void) => (source: Source<any>) => void;
export = forEach;
