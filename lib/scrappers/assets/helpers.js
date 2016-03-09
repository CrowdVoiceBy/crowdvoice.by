function firstTextIn (elements) {
  var content = '';
  for (var i=0; i < elements.length; i+=1) {
    content = $(elements[i]).text();
    if (content) {
      return content
        .trim();
    }
  }

  return '';
}

function absolutePath(sRelPath) {
  var nUpLn, sDir = "", sPath = location.pathname.replace(/[^\/]*$/, sRelPath.replace(/(\/|^)(?:\.?\/+)+/g, "$1"));
  for (var nEnd, nStart = 0; nEnd = sPath.indexOf("/../", nStart), nEnd > -1; nStart = nEnd + nUpLn) {
    nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
    sDir = (sDir + sPath.substring(nStart, nEnd)).replace(new RegExp("(?:\\\/+[^\\\/]*){0," + ((nUpLn - 1) / 3) + "}$"), "/");
  }
  return sDir + sPath.substr(nStart);
}

function getContentOrValue(selectors) {
  var values = [];

  selectors.forEach(function (selector) {
    if ($(selector).length > 0) {
      if ($(selector).attr('content')) {
        values.push($(selector).attr('content'));
      } else if ($(selector).attr('value')) {
        values.push($(selector).attr('value'));
      }
    }
  });

  return values;
}
