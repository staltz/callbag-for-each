var forEach = function forEach(operation) {
  return function(source) {
    var talkback;
    source(0, function(t, d) {
      if (t === 0) talkback = d;
      if (t === 1) operation(d);
      if (t === 1 || t === 0) talkback(1);
    });
  };
};

module.exports = forEach;
