/*
TODO:
add demo with examples + css


SAMPLE MARKUP

<table id="table-actions">
  <thead>
  <tr>
      <th>A</th>
      <th data-sort="true">B</th>
      <th data-sort="true">C</th>
      <th>D</th>
  </tr>
  </thead>
  <tbody>
          <tr class="group">
              <td colspan="4">
                Group 1
              </td>
          </tr>

          <tr>
              <td>g1 1</td>
              <td>g1 2</td>
              <td>g1 3</td>
              <td>g1 4</td>
          </tr>

          <tr>
              <td>g1 a</td>
              <td>g1 b</td>
              <td>g1 c</td>
              <td>g1 d</td>
          </tr>

          <tr class="group">
              <td colspan="4">
                Group 2
              </td>
          </tr>

          <tr>
              <td>g2 1</td>
              <td>g2 2</td>
              <td>g2 3</td>
              <td>g2 4</td>
          </tr>

          <tr>
              <td>g2 a</td>
              <td>g2 b</td>
              <td>g2 c</td>
              <td>g2 d</td>
          </tr>

  </tbody>
</table>


USAGE:
  $('#table-actions').simpleGroupSorter({
      group     :'tr.group',
      beforeSort:function () {

      }
  });

*/


(function ($) {

    $.fn.simpleGroupSorter = function (options) {
        var self = $(this);
        var options = options || {};
        var cols = self.find("thead").find("th[data-sort=true]");

        //# http://en.literateprograms.org/Merge_sort_(JavaScript)
        var Sorting = {
            shift:function (arr) {
                var bottom = $(arr).get(0);
                arr.splice(0, 1);
                return bottom;
            },
            merge:function (left, right, comparison) {
                var result = new Array();

                while ((left.length > 0) && (right.length > 0)) {
                    if (comparison(left[0], right[0]) <= 0)
                        result.push(Sorting.shift(left));
                    else
                        result.push(Sorting.shift(right));
                }
                while (left.length > 0)
                    result.push(Sorting.shift(left));
                while (right.length > 0)
                    result.push(Sorting.shift(right));
                return result;
            },

            merge_sort:function (array, comparison) {
                if (array.length < 2) return array;

                var middle = Math.ceil(array.length / 2);

                return Sorting.merge(
                    Sorting.merge_sort(array.slice(0, middle), comparison),
                    Sorting.merge_sort(array.slice(middle), comparison),
                    comparison
                );
            }
        };
        //#

        var sortFn = function (column_index, asc_mul, collection) {
            var new_order = Sorting.merge_sort(collection, function compare(a, b) {
                var itemAtext = $.trim($(a).find("td").eq(column_index).text());
                var itemBtext = $.trim($(b).find("td").eq(column_index).text());

                if (itemAtext < itemBtext)
                    return -1 * asc_mul;
                if (itemAtext > itemBtext)
                    return 1 * asc_mul;
                return 0;
            });

            $(new_order).each(function () {
                var myGroup = $(this).prevAll(options.group).first();
                myGroup.after($(this));
            });
        };

        var buildSorter = function (th) {
            var a = $("<a href='javascript:void(0)'></a>").addClass("sorter");
            a.click(function (e) {
                e.preventDefault();

                options && options.beforeSort && options.beforeSort();

                var asc_mul = 1;
                if (th.hasClass("sort_asc")) {
                    th.removeClass("sort_asc");
                    th.addClass("sort_desc");
                } else {
                    asc_mul = -1;
                    th.removeClass("sort_desc");
                    th.addClass("sort_asc");
                }
                th.siblings().removeClass("sort_asc sort_desc");
                var column_index = th.index();

                if (options.group) {
                    $(options.group, self.find('tbody')).each(function () {
                        sortFn(column_index, asc_mul, $(this).nextUntil(options.group)); //sort per groups
                    });
                } else {
                    sortFn(column_index, asc_mul, $('tr', self.find('tbody'))); //sort without groups
                }
            });

            th.append(a);
        };

        $(cols).each(function () {
            buildSorter($(this));
        });

    };
})(jQuery);
