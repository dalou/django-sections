// function screenshot(src, ifr) {

//     ifr = $('<iframe></iframe>').css({ width: '1200', zIndex: -1, position: "fixed", left: 0, top: 0 })
//     $('body').append(ifr);
//     ifr.attr('src', src)
//         .on('load', function(self) {
//         self = $(this);
//         ifr.height(ifr.contents().height());
//         ifr.contents().find('html,body').css('background', 'transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP4Xw8AAoABf5/NhYYAAAAASUVORK5CYII=) repeat !important')
//         setTimeout(function() {
//             html2canvas(ifr.contents().find('html,body')).then(function(canvas) {
//                 dataURL = canvas.toDataURL("image/png");
//                 $('#id_base64').val(dataURL).next().attr('src', dataURL);
//                 ifr.remove();

//             });
//         }, 5000);
//     });
// }

$(document).ready(function(UPDATE, QUERY_TO, editor) {
  if($('#id_source').length) {
    $('#id_source').hide().before(
     $('<div id="id_source_editor"></div>').text($('#id_source').val())
    ).after(
      $('<iframe  style="border:0px; width:100%;" id="id_source_preview"></iframe>')
    )
    $('#id_base64').hide();
    $('#id_base64').after('<img />')
    QUERY_TO = null;
    UPDATE = function() {
      $('#id_source').val(editor.getValue());
      $('#id_css').val(editor_css.getValue());
      $.post('/section/template/preview/', { source: editor.getValue()}, function(ifr) {
          $('#id_source_preview').attr('src', '/section/template/preview/').on('load', function(self) {
            ifr = $(this)
            ifr.height('auto');
            ifr.height(ifr.contents().height());
            ifr.contents().find('html,body').css('background', 'transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP4Xw8AAoABf5/NhYYAAAAASUVORK5CYII=) repeat !important')
            console.log(ifr.contents().find('html,body').css('background'))
            ifr.contents().click(function() {
                ifr.height('auto');
                ifr.height(ifr.contents().height());

            })
            //screenshot('/section/template/preview/')

            // setTimeout(function() {
            //    html2canvas(self.contents().find('html')).then(function(canvas) {
            //       $('#id_source_preview').after(canvas);

            //       dataURL = canvasRecord.toDataURL("image/png");
            //   });

            // }, 2000);

          })
      })

    }
    editor = ace.edit("id_source_editor");
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