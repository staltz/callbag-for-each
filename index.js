const forEach = operation => source => {
  let sourceTalkback;
  let sinkTalkback;
  source(0, (t, d) => {
    if (t === 0) sourceTalkback = d;
    if (t === 1) operation(d);
    if (t === 1 || t === 0) sourceTalkback(1);
    if (t !== 0 && sinkTalkback) sinkTalkback(t, d);
  });
  return (start, sink) => {
    if (start !== 0) return;
    sinkTalkback = sink;
    sink(0, (t, d) => {
      if (t === 2) sinkTalkback = null;
    });
  }
};

module.exports = forEach;
