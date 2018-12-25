const test = require('tape');
const forEach = require('.');

test('it iterates a finite pullable source', (t) => {
  t.plan(12);
  const upwardsExpected = [[1, undefined], [1, undefined], [1, undefined]];
  const downwardsExpected = ['a', 'b', 'c'];

  const sink = forEach(x => {
    t.equals(x, downwardsExpected.shift(), 'downwards data is expected');
  });

  function makeSource() {
    let sent = 0;
    let sinkRef;
    return function source(type, data) {
      if (type === 0) {
        sinkRef = data;
        sinkRef(0, source);
        return;
      }
      if (sent === 3) {
        sinkRef(2);
        return;
      }
      t.true(upwardsExpected.length > 0, 'source can be pulled');
      const expected = upwardsExpected.shift();
      t.equals(type, expected[0], 'upwards type is expected');
      t.equals(data, expected[1], 'upwards data is expected');
      if (sent === 0) {
        sent++;
        sinkRef(1, 'a');
        return;
      }
      if (sent === 1) {
        sent++;
        sinkRef(1, 'b');
        return;
      }
      if (sent === 2) {
        sent++;
        sinkRef(1, 'c');
        return;
      }
    };
  }

  const source = makeSource();
  sink(source);
});

test('it observes an async finite listenable source', t => {
  t.plan(14);
  const upwardsExpected = [
    [0, 'function'],
    [1, 'undefined'],
    [1, 'undefined'],
    [1, 'undefined'],
    [1, 'undefined'],
  ];
  const downwardsExpected = [10, 20, 30];

  function makeSource() {
    let sent = 0;
    const source = (type, data) => {
      const e = upwardsExpected.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data is expected: ' + e[1]);
      if (type === 0) {
        const sink = data;
        const id = setInterval(() => {
          if (sent === 0) {
            sent++;
            sink(1, 10);
            return;
          }
          if (sent === 1) {
            sent++;
            sink(1, 20);
            return;
          }
          if (sent === 2) {
            sent++;
            sink(1, 30);
            return;
          }
          if (sent === 3) {
            sink(2);
            clearInterval(id);
            return;
          }
        }, 100);
        sink(0, source);
      }
    };
    return source;
  }

  const source = makeSource();
  forEach(x => {
    const e = downwardsExpected.shift();
    t.equals(x, e, 'downwards data is expected: ' + e);
  })(source);

  setTimeout(() => {
    t.pass('nothing else happens');
    t.end();
  }, 700);
});

