


function template_category_create(editor, parent) {

    var page_name = prompt('Template name')
    if(page_name && $.trim(page_name) != "") {
        var page = new TemplateCategory({ editor: editor, name: page_name, parent: parent });
        page.update();
    }
}

// function page_reorder(pages) {
//     page.$menuItem
// }

function templates_init(editor) {
    $.get('/admin/sections/editor/templates/', null, function(data) {
        for(var i in data) {
            var template_category_data = data[i];
            template_category_data.editor = editor
            new TemplateCategory(data[i]);
        }
    });

    editor.$templatesMenu.on('click', 'a', function(e) {
        editor.open_form({
            set_form: function(form) {

                for(var i in editor.templates) {
                    var category = editor.templates[i];
                    category.set_form(form);
                }
            },
            save: function() {},
            cancel: function() {

            }
        }, 'Templates', 600)
        e.stopPropagation();
        return false;
    });
}

function TemplateCategory(data, root, self) {
    self = this;
    self.init(data);
    self.root = root;


}
TemplateCategory.prototype.init = function(data, self) {
    self = this;
    self.editor = data.editor;
    self.parent = data.parent;
    self.pk = data.pk;
    self.name = data.name;
    self.order = data.order;
    self.templates = [];

    for(var i in data.templates) {
        new Template(self, data.templates[i]);
    }

    new Template(self, {
        name: "New",
        source: 'new section',
        image: 'https://cdn4.iconfinder.com/data/icons/simplicio/128x128/file_add.png'
    });
    self.editor.templates.push(self);

}
TemplateCategory.prototype.set_form = function(form, self) {
    self = this;

    for(var i in self.templates) {
        var template = self.templates[i];


        var $content = $('<img src="'+template.image+'" style="width:100%;padding:10px;display:inline;" />');
        $content[0].template = template;

        var insertor = function($content, template, $insertor) {
            $insertor = $('<button class="">insert</button>').on('click', function() {
                template.insert();
            });
            $content.tooltipster({
                content: $insertor,
                interactive: true,
            });
        }
        insertor($content, template);

        //$content.draggable()

        $content.on('dblclick', function() {
            self.editor.open_form(this.template, 'Template editing (be careful, developer level)', 900 );
        })

        var tab = form.add_tab(self.name, $content);
        tab.content.css({ backgroundColor: '#2f4154' })
    }
    tab.content.sortable({
        items: 'img',
        helper: 'clone'
    })
    tab.content.disableSelection();
}

TemplateCategory.prototype.update = function(callback, self) {
    self = this
    data = {
        pk: self.pk,
        parent: self.parent ? self.parent.pk : null,
        name: self.name,
    }
    $.ajax({
        method: 'POST',
        url: '/admin/sections/editor/template_category/'+(self.pk ? 'update' : 'create')+'/',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            self.init(data);
        }
    });

}

























function Template(category, data, self) {
    self = this;
    self.category = category;
    self.editor = category.editor;
    self.pk = data.pk;
    self.name = data.name;
    self.source = data.source;
    self.image = data.image;
    self.css = data.css;
    // self.$template = $('\
    //     <li class="template" data-pk="'+self.pk+'" >\
    //         <img  src="'+data.image+'" alt="{{ template.name }}">\
    //         <div class="editor-template-actions">\
    //             <button type="button" class="insert btn btn-danger btn-sm"><span class="fui-plus"></span></button>\
    //         </div>\
    //     </li>');
    // self.$template.appendTo(self.editor.$templates.find('ul'));

    self.category.templates.push(self)
}



Template.prototype.set_form = function(form, textarea, source_editor, CROP_INIT, $preview, self) {
    self = this;


    var rand = (new Date().getTime());
    var source_id = rand+'-source';
    var $source = $('<textarea id="'+source_id+'">'+self.source+'</textarea>');
    var tab = form.add_tab('Source', $source);

    textarea = $source
    source_editor = ace.edit(source_id);
    source_editor.setTheme("ace/theme/monokai");
    source_editor.getSession().setMode("ace/mode/twig");
    source_editor.setOptions({
      maxLines: Infinity
    });
    source_editor.resize();
    source_editor.on("change", function(e) {

        textarea.val(source_editor.getValue());
    });
    textarea.val(source_editor.getValue());
    self.source_editor = source_editor;


    $preview = $('<iframe></iframe>').css({ width: '100%', border: 0 });
    preview_tab = form.add_tab('Preview', $preview);
    preview_tab.tab.on('click', function() {
        //preview_tab.content.find('.pre view-tab').addLoading();
        postJSON('/admin/sections/editor/template/preview/', {
            source: source_editor.getValue(),
            layout: true,
        }, function(data) {
            $preview.attr('src', data);
        })
    });
    $preview.on('load', function() {
        $preview.height($preview.contents().height())
    })

    form.$modal.on('dialogresize', function( event, ui ) {

        source_editor.resize();
    });

    var css_id = rand+'-css';
    var $css = $('<textarea id="'+css_id+'"></textarea>');
    form.add_tab('CSS', $css);


    var css_id = rand+'-img';
    var $css = $('<img src=""  />');
    form.add_tab('Image', $css);

    CROP_INIT = function($form, src, crop) {

        src = $('#id_image_base64').val()
        crop = $('#id_image_base64_crop').val()
        $form.find('.image-base64').empty().append(
            $('<img />').attr('src', src).css({
                width: "100%"
            }).cropper({
              // aspectRatio: 16 / 9,
              autoCropArea: 0.65,
              strict: false,
              guides: false,
              highlight: false,
              dragCrop: false,
              cropBoxMovable: false,
              cropBoxResizable: false
            })
        )
    }

}
Template.prototype.preview = function(self) {
    self = this;
    self.editor.postJSON('/admin/sections/editor/template/preview/', {
        pk: self.pk,
        source: self.source,
        css: self.css,
        layout: true,
    }, function(data) {

    });
}
Template.prototype.save = function(self) {
    self = this;

    self.source = self.source_editor.getValue();


    self.editor.postJSON('/admin/sections/editor/template/'+(self.pk ? 'update' : 'create')+'/', {
        pk: self.pk,
        name: self.name,
        source: self.source,
        base64: self.base64,
        category: self.category.pk,
        css: self.css
    }, function(data) {
        self.pk = data.pk,
        self.name = data.name,
        self.source = data.source,
        self.image = data.image
    });
}
Template.prototype.cancel = function(self) {

}

function create_template(editor, category, image64) {
    self.editor.postJSON('/admin/sections/editor/template/create/', {
        name: self.name,
        source: self.source,
        css: self.css,
        image64: image64
    }, function(data) {

    });
}

Template.prototype.insert = function() {
    //this.editor.current_page.
    var section = new Section({
        page: this.editor.current_page,
        template: this.pk
    });
    section.save();
    //this.editor.current_page.open();
    //section.changed();
    document.location.reload()
}
Template.prototype.to_json = function(has_changed) {
    return {
        pk: this.pk,
        source: this.source,
        image: this.image
    }
};
