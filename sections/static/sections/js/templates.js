function TemplateCategory(editor, data, self) {
    self = this
    self.editor = editor;
    self.name = data.name;
    self.is_system = data.is_system;
    self.templates = [];
    self.$templates = self.editor.$templates;
    //$('<ul class="dropdown-menu sub-menu"></ul>')
    // self.$templates.css({
    //   overflowY: 'auto',
    //   height: '100%'
    // })
    self.$li = $('<li><a class="" ></a></li>')
    self.$link = self.$li.find('a').text(self.name)//.addClass('right-caret');
    //self.$li.append(self.$templates);
    self.$link.on('click', function() {
        self.open();
    });
    $('#categories').append(self.$li);
    for(var i in data.templates) {
        new Template(self, data.templates[i]);
    }
    self.editor.template_categories.push(self);

}
TemplateCategory.prototype.open = function() {
    for(var i in this.editor.template_categories) {
        this.editor.template_categories[i].hide();
    }
    this.show();
    this.editor.$templates.slideDown();
}
TemplateCategory.prototype.show = function() {
    for(var i in this.templates) {
        this.templates[i].$li.show();
        console.log(this.templates[i].$link)
    }
}
TemplateCategory.prototype.hide = function() {
    for(var i in this.templates) {
        this.templates[i].$li.hide();
    }
}


function Template(category, data, self) {
    self = this
    self.category = category;
    self.editor = category.editor;
    self.pk = data.pk;
    self.source = data.source;
    self.image = data.image;
    self.$li = $('<li ><a><img  style="max-width:300px;"/></a></li>')
    self.$link = self.$li.find('a')
    self.$link.on('click', function() {
        self.insert();
    });
    self.$link.find('img').attr('src', data.image)
    self.category.$templates.append(self.$li)
    self.category.templates.push(self);
    self.editor.templates.push(self);
}
Template.prototype.insert = function() {
    //this.editor.current_page.
    var section = new Section(this.editor.current_page, {

    }, this);
    this.editor.current_page.open();
    section.changed();
}
Template.prototype.to_json = function(has_changed) {
    return {
        pk: this.pk,
        source: this.source,
        image: this.image
    }
};

// $(document).ready(function(UPDATE, QUERY_TO) {
//   if($('#id_source').length) {
//     $('#id_source').hide().before(
//      $('<div id="id_source_editor"></div>').text($('#id_source').val())
//     ).after(
//       $('<iframe  style="border:0px; width:100%;" id="id_source_preview"></iframe>')
//     )
//     QUERY_TO = null;
//     UPDATE = function() {
//       $('#id_source').val(editor.getValue());
//       $('#id_css').val(editor_css.getValue());
//       $.post('/section/template/preview/', { source: editor.getValue()}, function() {
//           $('#id_source_preview').attr('src', '/section/template/preview/').on('load', function(self) {
//             self = $(this)
//             $(this).height($(this).contents().height());

//             setTimeout(function() {
//                html2canvas(self.contents().find('html')).then(function(canvas) {
//                   $('#id_source_preview').after(canvas);

//                   dataURL = canvasRecord.toDataURL("image/png");
//               });

//             }, 2000);

//           })
//       })

//     }
//     var editor = ace.edit("id_source_editor");
//     editor.setTheme("ace/theme/monokai");
//     editor.getSession().setMode("ace/mode/twig");
//     editor.setOptions({
//       maxLines: Infinity
//     });
//     editor.resize();
//     editor.on("change", function(e) {

//       if(QUERY_TO) {
//         clearTimeout(QUERY_TO);
//       }
//       QUERY_TO = setTimeout(function() {
//         UPDATE();

//       }, 500);
//     });

//     $('#id_stylus').hide().before(
//      $('<div id="id_stylus_editor"></div>').text($('#id_css').val()).css({ height: 300 })
//     )

//     var editor_css = ace.edit("id_stylus_editor");
//     editor_css.setTheme("ace/theme/monokai");
//     editor_css.getSession().setMode("ace/mode/stylus");
//     editor_css.setOptions({
//       maxLines: Infinity
//     });
//     editor_css.resize();

//     UPDATE();
//   }

// });