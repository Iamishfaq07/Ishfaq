/* Tiny syntax highlighter.
   Works on the text of a <code> element and rebuilds it as escaped
   spans — it never interprets the source as HTML, so a post can't
   smuggle markup through a code fence. */
(function () {
  'use strict';

  var esc = function (s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  var KEYWORDS = {
    common: ['if', 'else', 'elif', 'for', 'while', 'return', 'break', 'continue', 'in', 'not',
      'and', 'or', 'true', 'false', 'null', 'none', 'new', 'try', 'catch', 'except', 'finally',
      'raise', 'throw', 'class', 'def', 'function', 'const', 'let', 'var', 'import', 'from',
      'export', 'default', 'async', 'await', 'yield', 'with', 'as', 'pass', 'lambda', 'this',
      'self', 'typeof', 'instanceof', 'delete', 'void', 'switch', 'case', 'do', 'echo', 'set'],
  };

  // One pass, longest-first alternation: comments, strings, numbers, words.
  var RE = new RegExp([
    '(#[^\\n]*|//[^\\n]*|/\\*[\\s\\S]*?\\*/)',            // 1 comment
    '("(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`)', // 2 string
    '\\b(\\d+(?:\\.\\d+)?)\\b',                            // 3 number
    '\\b([A-Za-z_][A-Za-z0-9_]*)\\b(\\s*\\()?',            // 4 word, 5 call paren
  ].join('|'), 'g');

  function highlight(code) {
    var out = '';
    var last = 0;
    var m;
    RE.lastIndex = 0;
    while ((m = RE.exec(code)) !== null) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<span class="t-com">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="t-str">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="t-num">' + esc(m[3]) + '</span>';
      else if (m[4]) {
        var w = m[4];
        var cls = KEYWORDS.common.indexOf(w.toLowerCase()) > -1 ? 't-key' : (m[5] ? 't-fn' : '');
        out += cls ? '<span class="' + cls + '">' + esc(w) + '</span>' : esc(w);
        if (m[5]) out += esc(m[5]);
      }
      last = m.index + m[0].length;
    }
    out += esc(code.slice(last));
    return out;
  }

  window.highlightCode = function (root) {
    Array.prototype.slice.call((root || document).querySelectorAll('pre > code')).forEach(function (el) {
      if (el.dataset.hl) return;
      el.dataset.hl = '1';
      el.innerHTML = highlight(el.textContent);
    });
  };
})();
