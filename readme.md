# callbag-for-each

Callbag sink that consume both pullable and listenable sources. When called on a pullable source, it will iterate through its data. When called on a listenable source, it will observe its data.

`npm install callbag-for-each`

## example

Consume a pullable source:

```js
const fromIter = require('callbag-from-iter');
const forEach = require('callbag-for-each');

const source = fromIter([10,20,30,40])

forEach(x => console.log(x))(source); // 10
                                      // 20
                                      // 30
                                      // 40
```

Consume a listenable source:

```js
const interval = require('callbag-interval');
const forEach = require('callbag-for-each');

const source = interval(1000);

forEach(x => console.log(x))(source); // 0
                                      // 1
                                      // 2
                                      // 3
                                      // ...
```

