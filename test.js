const test = require('tape');
const forEach = require('./index');

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

test('it passes data between source and a downstream sink', t => {
  let history = [];
  const report = (name,dir,t,d) => t !== 0 && d !== undefined && history.push([name,dir,t,d]);

  const source = makeMockCallbag('source', report, true);
  const middle = forEach(x => history.push(['middle', 1, x]));
  const sink = makeMockCallbag('sink', report);

  middle(source)(0, sink);

  source.emit(1, 'foo');
  source.emit(1, 'bar');
  sink.emit(1, 'baz');
  source.emit(2, 'errormsg');

  t.deepEqual(history, [
    ['middle', 1, 'foo'],
    ['sink', 'fromUp', 1, 'foo'],
    ['middle', 1, 'bar'],
    ['sink', 'fromUp', 1, 'bar'],
    ['sink', 'fromUp', 2, 'errormsg']
  ], 'forEach passed data downstream as expected');

  t.end();
});

test('it stops passing data on if sink terminates', t => {
  let history = [];
  const report = (name,dir,t,d) => t !== 0 && d !== undefined && history.push([name,dir,t,d]);

  const source = makeMockCallbag('source', report, true);
  const middle = forEach(x => history.push(['middle', 1, x]));
  const sink = makeMockCallbag('sink', report);

  middle(source)(0, sink);

  source.emit(1, 'foo');
  sink.emit(2);
  source.emit(1, 'bar');

  t.deepEqual(history, [
    ['middle', 1, 'foo'],
    ['sink', 'fromUp', 1, 'foo'],
    ['middle', 1, 'bar'],
  ], 'sink doesnt receive more messages after termination');

  t.end();
});

function makeMockCallbag(name, report=()=>{}, isSource) {
  let talkback;
  let mock = (t, d) => {
    if (t === 0){
      talkback = d;
      if (isSource) talkback(0, (st, sd) => report(name, 'fromDown', st, sd));
    }
    report(name, 'fromUp', t, d);
  };
  mock.emit = (t, d) => {
    if (!talkback) throw new Error(`Can't emit from ${name} before anyone has connected`);
    talkback(t, d);
  };
  return mock;
}
