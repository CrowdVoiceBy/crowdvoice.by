Module(CV, 'HelperVoice')({
  prototype: {
    /* Returns an array with the pages indexes that should be created.
     * @param {Object} data - locals.pagesForMonths[approved||unapproved]
     *  {"2015":
     *    "12": {page: "0", count: "100"},
     *    "11": {page: "1", count: "20"},
     *    "07": {page: "2", count: "13"}
     *  }
     * @return {Array} pages
     *  => [0, 1, 2]
     */
    _formatPagesObject: function _formatPagesObject(data) {
      var pages = [];

      Object.keys(data).forEach(function(year) {
        Object.keys(data[year]).forEach(function(month) {
          pages.push(data[year][month].page);
        });
      });

      return pages.reduce(function (a, b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
      }, []).sort(function (a, b) {
        return a - b;
      });
    },
  }
});
