$(document).ready(function(UPDATE, QUERY_TO) {
  if($('#id_source').length) {
    $('#id_source').hide().before(
     $('<div id="id_source_editor"></div>').text($('#id_source').val())
    ).after(
      $('<iframe  style="border:0px; width:100%;" id="id_source_preview"></iframe>')
    )
    QUERY_TO = null;
    UPDATE = function() {
      $('#id_source').val(editor.getValue());
      $('#id_css').val(editor_css.getValue());
      $.post('/section/template/preview/', { source: editor.getValue()}, function() {
          $('#id_source_preview').attr('src', '/section/template/preview/').on('load', function(self) {
            self = $(this)
            $(this).height($(this).contents().height());

            setTimeout(function() {
               html2canvas(self.contents().find('html')).then(function(canvas) {
                  $('#id_source_preview').after(canvas);

                  dataURL = canvasRecord.toDataURL("image/png");
              });

            }, 2000);

          })
      })

    }
    var editor = ace.edit("id_source_editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/twig");
    editor.setOptions({
      maxLines: Infinity
    });
    editor.resize();
    editor.on("change", function(e) {

      if(QUERY_TO) {
        clearTimeout(QUERY_TO);
      }
      QUERY_TO = setTimeout(function() {
        UPDATE();

      }, 500);
    });

    $('#id_stylus').hide().before(
     $('<div id="id_stylus_editor"></div>').text($('#id_css').val()).css({ height: 300 })
    )

    var editor_css = ace.edit("id_stylus_editor");
    editor_css.setTheme("ace/theme/monokai");
    editor_css.getSession().setMode("ace/mode/stylus");
    editor_css.setOptions({
      maxLines: Infinity
    });
    editor_css.resize();

    UPDATE();
  }

});