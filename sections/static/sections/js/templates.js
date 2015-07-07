
$(document).ready(function(CREATE_INIT, CROP_INIT) {

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

    CREATE_INIT = function($form, source_editor, handlePaste) {
        console.log($form)
        textarea = $form.find("#id_source")
        source_editor = ace.edit("id_source");
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
        // kwargs.$editor.on('click', '.nav .save', function() {
        //     self.source = kwargs.source_editor.getValue();
        //     self.update();
        // })

        CROP_INIT($form)

        $form.on('click', '.preview-trigger', function() {
            $form.find('.pre view-tab').addLoading();
            postJSON('/admin/sections/editor/template/preview/', {
                source: source_editor.getValue()
            }, function(data) {
                $form.find('.preview-tab iframe').attr('src', data);
            })
        });
        handlePaste = function(e) {
            for (var i = 0 ; i < e.clipboardData.items.length ; i++) {
                var item = e.clipboardData.items[i];
                console.log("Item: " + item.type);
                if (item.type.indexOf("image") != -1) {
                    console.log(item);

                    var data = item.getAsFile();
                    var fr = new FileReader;
                    fr.onloadend = function() {
                        $('#id_image_base64').val(fr.result)
                        CROP_INIT($form);
                    };
                    fr.readAsDataURL(data);

                } else {
                    console.log("Discardingimage paste data");
                }
            }
        }
        $form.find('.image-base64')[0].addEventListener("paste", handlePaste);
        $form.on('submit', function() {

            console.log($form);
            var data = $form.serializeArray();
            data.push({
                name: 'source', value: source_editor.getValue()
            });
            console.log(data)
            $.ajax({
                method: $form.attr('method'),
                url: $form.attr('action'),
                data: data,
                success: function(data) {
                    data = $(data).addClass('in');
                    console.log(data)
                    if(data.is('form')) {
                        $form.replaceWith(data)
                        CREATE_INIT(data);
                    }
                }
            })
            return false;
        })
    }

    $(document).on('click', '.template-add, .template-edit', function() {
        $(this).sectionsModal({
            target: $(this).data('href'),
            open: function($modal, source_editor, textarea) {
                CREATE_INIT($modal);
            }
        });
        return false;
    });



})


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

    editor.$templatesMenu = $('#template-categories-menu');
    editor.$templatesMenu.on('click', '>.template-categories-add', function(e) {
        template_category_create(editor)
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

    if(!self.$menuItem) {
        self.$menuItem = $('\
            <li class="">\
                <a data-pk="'+self.pk+'" class="trigger '+(data.templates && data.templates.length ? 'right-caret' : '') +'" >'+self.name+'</a>\
                <ul class="dropdown-menu sub-menu">\
                    <li class="template-categories-add">\
                        <a class="">\
                            <span class="fui-plus"></span>\
                        </a>\
                    </li>\
                </ul>\
            </li>')

        self.$menuItem.on('click', 'a.trigger', function(e) {
            self.open();
            self.editor.close_editor();
            $('#template_category_root').parent().removeClass('open')
            e.stopPropagation();
        })
        self.$menuItem.on('click', '> ul > li.template-categories-add a', function(e) {
            template_category_create(self.editor, self);
            e.stopPropagation();
        })

        if(self.parent) {
            self.parent.$menuItem.find('>ul').append(self.$menuItem);
            self.parent.$menuItem.find('>ul>li').eq(-1).after(self.parent.$menuItem.find('>ul>li.template-categories-add'));
            self.parent.pages.push(self);
        }
        else {
            self.editor.$templatesMenu.append(self.$menuItem);
            self.editor.$templatesMenu.find('>li').eq(-1).after(self.editor.$templatesMenu.find('>li.template-categories-add'));
        }


        for(var i in data.templates) {
            new Template(self, data.templates[i]);
        }

        new Template(self, {
            name: "New",
            source: 'new section',
            image: 'https://cdn4.iconfinder.com/data/icons/simplicio/128x128/file_add.png'
        });
        self.editor.templates.push(self)
    }

    self.$menuItem

}
TemplateCategory.prototype.get_editor = function(kwargs, self) {
    self = this;
    kwargs = {}
    kwargs.$editor = $('<li class="template-category"><a data-pk="'+self.pk+'">\
        '+self.name+'\
    </a></li>');
    // kwargs.$ul = kwargs.$editor.find('ul').css({
    //     position: 'absolute',
    // }).hide();
    // kwargs.$editor.on('click', 'a', function() {
    //     kwargs.$ul.fadeIn();
    // })
    // for(var i in self.templates) {
    //     kwargs.$editor.parent().find('ul').hide();
    //     kwargs.$editor.find('>ul').append(self.templates[i].get_item());
    // }
    return kwargs.$editor;
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


Template.prototype.get_item = function(kwargs, self) {
    self = this; kwargs = kwargs ? kwargs : {}

    kwargs.$element = $('<li class="template category-'+self.category.pk+'">\
            <img src="'+self.image+'" style="'+(self.pk ? "":"padding:80px;")+'" />\
            <div class="mask" style="padding:5px;">\
                '+(self.pk ?
                '<button type="button" class="edit up btn btn-sm btn-inverse pull-left"><span class="fui-pencil"></span> Edit</button>\
                <button type="button" class="insert up btn btn-inverse pull-right"><span class="fui-plus"></span> Insert</button>' :
                '<button type="button" class="edit up btn btn-sm btn-inverse pull-left"><span class="fui-pencil"></span> Add</button>')+'\
            </div>\
        </li>');


    kwargs.$element.on('click', 'button.insert', function() {
        if(self.editor.current_page) {
            var section = new Section({
                page: self.editor.current_page,
                template: self.pk
            });
            section.update()
        }
        // kwargs.helper = $('<img src="'+self.image+'" style="width:150px;" />').css({
        //     position: 'absolute'
        // });
        // $('body').append(kwargs.helper);
        // $(document).on('template.mousemove', function() {
        //     kwargs.helper.offset({ top: e.pageY-150, left: e.pageX+150 });
        // })

    })
    kwargs.$element.on('click', 'button.edit', function() {

        self.edit_template();
    });
    //console.log(self.editor.current_page.$page.contents().find('body'))
    // $element.draggable({
    //     iframeFix: true,
    //     revert: "invalid",
    //     helper: function( event ) {
    //         return $( "<div class='ui-widget-header'>I'm a custom helper</div>" );
    //       },
    //     zIndex: 1002,
    //     appendTo: 'body',
    //     //distance: 15,
    //     //connectToSortable: self.editor.current_page.$page.contents().find('body'),
    // })
    return kwargs.$element;
}


Template.prototype.edit_template = function(kwargs, self) {
    self = this; kwargs = kwargs ? kwargs : {}


    kwargs.$editor = self.get_editor(kwargs);
    self.editor.open_editor(kwargs.$editor, '80%');

    kwargs.source_editor = ace.edit(kwargs.source_id);
    kwargs.source_editor.setTheme("ace/theme/monokai");
    kwargs.source_editor.getSession().setMode("ace/mode/twig");
    kwargs.source_editor.setOptions({
      maxLines: Infinity
    });
    kwargs.source_editor.resize();
    kwargs.source_editor.on("change", function(e) {

        kwargs.$textarea.val(kwargs.source_editor.getValue());
    });

    kwargs.$editor.on('click', '.nav .save', function() {
        self.source = kwargs.source_editor.getValue();
        self.update();
    })
    kwargs.$editor.on('click', '.preview-trigger', function() {
        kwargs.$preview.addLoading();
        self.editor.postJSON('/admin/sections/editor/template/preview/', {
            source: kwargs.source_editor.getValue()
        }, function(data) {
            kwargs.$preview.attr('src', data);
        })
    })

    // $('#id_stylus').hide().before(
    //     $('<div id="id_stylus_editor"></div>').text($('#id_css').val()).css({ height: 300 })
    // )
}


Template.prototype.get_editor = function(kwargs, self) {
    self = this; kwargs = kwargs ? kwargs : {}

    kwargs.rand_id = (new Date().getTime());
    kwargs.source_id = kwargs.rand_id+'-source';
    kwargs.css_id = kwargs.rand_id+'-css';
    kwargs.$editor = $('\
        <div>\
            <h3><span class="fui-new"></span> Template '+self.name+'</h3>\
            <div>\
                <ul class="nav nav-tabs">\
                    <li class="active"><a href="#template-'+kwargs.rand_id+'-source"><span class="fui-new"></span> Source</a></li>\
                    <li class="preview-trigger"><a href="#template-'+kwargs.rand_id+'-preview"><span class="fui-new"></span> Preview</a></li>\
                    <li class=""><a href="#template-'+kwargs.rand_id+'-css"><span class="fui-new"></span> CSS</a></li>\
                    <li class=""><a href="#template-'+kwargs.rand_id+'-image"><span class="fui-new"></span> Image</a></li>\
                    <li class="pull-right"><button class="btn btn-sm btn-success save"><span class="fui-new"></span> Save</button></li>\
                </ul>\
                <div class="tab-content">\
                    <div class="tab-pane active" id="template-'+kwargs.rand_id+'-source"><textarea id="'+kwargs.source_id+'">'+self.source+'</textarea></div>\
                    <div class="tab-pane" id="template-'+kwargs.rand_id+'-preview"><iframe></iframe></div>\
                    <div class="tab-pane" id="template-'+kwargs.rand_id+'-css"><textarea id="'+kwargs.css_id+'"></textarea></div>\
                    <div class="tab-pane" id="template-'+kwargs.rand_id+'-image"><img /><textarea ></textarea></div>\
                </div>\
            </div>\
        </div>');
    kwargs.$textarea = kwargs.$editor.find('#'+kwargs.source_id);
    // kwargs.$textarea.val(self.source);
    // console.log(kwargs.$textarea, kwargs.$textarea.val())
    kwargs.$preview = kwargs.$editor.find('#template-'+kwargs.rand_id+'-preview iframe');
    kwargs.$preview.on('load', function() {
        $(this).height($(this).contents().height());
        kwargs.$preview.removeLoading();
    }).css({
        width: '100%', height: '100%', border: 0
    })
    kwargs.$css = kwargs.$editor.find('#'+kwargs.css_id);
    kwargs.$css.val(self.css);

    kwargs.$image = kwargs.$editor.find('#template-'+kwargs.rand_id+'-image')

    kwargs.$image.find('textarea').hide();
    if(self.image) {
        kwargs.$image.find('img').attr('src', self.image)
    }
    else {
        kwargs.$image.find('img').attr('src', 'https://cdn4.iconfinder.com/data/icons/simplicio/128x128/file_add.png')
    }
    kwargs.$image.find('img')[0].addEventListener("paste", function(e) {
        for (var i = 0 ; i < e.clipboardData.items.length ; i++) {
            var item = e.clipboardData.items[i];
            if (item.type.indexOf("image") != -1) {
                var filereader = new FileReader();
                filereader.onload = function (base64, imgData) {
                    imgData = base64.target.result;
                    kwargs.$image.find('img').attr('src', imgData)
                    self.base64 = imgData
                    self.image = imgData
                }
                filereader.readAsDataURL(item.getAsFile());
            } else {
                //console.log("Discarding image paste data");
            }
        }
    });

    return kwargs.$editor;
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
Template.prototype.update = function(self) {
    self = this;
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