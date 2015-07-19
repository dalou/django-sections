// var sections_plugins = []

var postJSON = function(url, data, success) {
    $.ajax({
        method: 'POST',
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        headers: {'content-type': 'application/json'},
        success: success
    });
}


// Template.prototype.edit = function(self) {
//     self = this;
//     self.editor.$editor.empty();
//     self.editor.$editor.html('\
//         <div class="element-editor"><h3><span class="fui-new"></span>Template editor</h3>\
//             <ul class="nav nav-tabs">\
//                 <li class="active">\
//                     <a href="#editor-tab-1"><span class="fui-new"></span> Code</a>\
//                 </li>\
//                 <li class="">\
//                     <a href="#editor-tab-2"><span class="fui-new"></span> Preview</a>\
//                 </li>\
//                 <li class="">\
//                     <a href="#editor-tab-3"><span class="fui-new"></span> Screenshot</a>\
//                 </li>\
//             </ul>\
//             <div class="tab-content" id="#editor-tab-1"></div>\
//             <div class="tab-content" id="#editor-tab-2"></div>\
//             <div class="tab-content" id="#editor-tab-3"></div>\
//         </div>');

//     self.editor.open_editor('90%')

// }


function Editor(version, self) {
    self = this;

    self.values = [];
    self.styles = [];
    self.tabs = [];
    self.inputs = [];
    self.pages = {}
    self.templates = [];
    self.active_version = null;

    self.current_page = null;

    //self.section_editor = new SectionEditor(self)
}
Editor.prototype.add_tab = function(name, title) {
    this.tabs[name] = title;
}
Editor.prototype.add_value = function(name, value) {
    value.name = name;
    this.values[name] = value;
}
Editor.prototype.add_input = function(name, input) {
    input.name = name;
    this.inputs[name] = input;
}
Editor.prototype.add_style = function(name, style) {
    style.name = name;
    this.styles[name] = style;
}

var PageEditor = new Editor();


Editor.prototype.init = function(data, self) {
    self = this;

    self.$section_action = $('#section-actions')
    self.$main = $('#main');
    self.$sidebar = $('#sidebar');
    self.$editor = $('#editor')
    self.$templates = $('#templates');
    self.current_page = null;
    self.current_version = null;
    self.active_version = null;

    self.$page = $('#page');
    self.$nav = $('<div class="__sections__ __sections__nav">\
        <div class="__sections__nav_handle">Admin Editor</div>\
        <nav class="navbar navbar-inverse navbar-embossed" role="navigation">\
            <div class="collapse navbar-collapse">\
                <ul class="nav navbar-nav navbar-left">\
                    <li class="dropdown" id="__sections__versions_menu">\
                        <a class="__section__nav_a dropdown-toggle" data-toggle="dropdown"></a>\
                        <span class="dropdown-arrow"></span>\
                        <ul class="editor-pages-menu dropdown-menu">\
                            <li class="add">\
                                <a>\
                                    New version\
                                </a>\
                            </li>\
                            <li class="clone">\
                                <a class="">\
                                    Clone this version\
                                </a>\
                            </li>\
                            <li class="activate">\
                                <a class="">\
                                    Activate this version\
                                </a>\
                            </li>\
                            <li class="separator"></li>\
                        </ul>\
                    </li>\
                    <li class="dropdown" id="__sections__pages_menu">\
                        <a class="__section__nav_a dropdown-toggle" data-toggle="dropdown" ></a>\
                        <span class="dropdown-arrow"></span>\
                        <ul class="editor-pages-menu dropdown-menu">\
                            <li class="separator"></li>\
                            <li class="add">\
                                <a>\
                                    <span class="fui-plus"></span>\
                                </a>\
                            </li>\
                        </ul>\
                    </li>\
                    <li class="dropdown" id="__sections__templates_menu">\
                        <a class="__section__nav_a" >\
                            Templates\
                        </a>\
                    </li>\
                </ul>\
            </div>\
        </nav>\
    </div>').draggable({
        handle: '.__sections__nav_handle',
        containment: "parent",
        scroll: true
    });
    if($('body').height() < 100) {
        $('body').css({ minHeight: $(window).height() });
    }
    $('body').append(self.$nav);

    self.$pagesMenu = $('#__sections__pages_menu')
    self.$versionsMenu = $('#__sections__versions_menu')
    self.$templatesMenu = $('#__sections__templates_menu')

    //self.$editor.accordion()

    templates_init(this);
    pages_init(this);
    versions_init(this);


    /* PAGES */


    /************** EDITOR ***************/
    // self.$editor.on('click', '>.close', function() {
    //     self.close_editor();
    // })


    /************** TEMPLATES ***************/
    // self.$templates.on('click', 'a.close', function(e) {
    //     self.close_templates();
    // });
    // self.$templates.on('click', 'button.insert', function(e) {
    //     self.insert_template($(this).parent().parent());

    // });
    // self.$templates.on('click', 'button.thumbnail', function(e) {
    //     self.template_screenshot($(this).parent().parent())
    // });
    // self.$templates_menu = $('#editor-templates-menu')


    /************** PAGES ***************/

    // $('#page-container button.page-delete').on('click', function() {
    //     self.current_page.remove();
    // })


    // self.$pagesMenu.on('click', 'a.trigger', function(e) {

    //     $.fn.addLoadingFull();
    //     $('#pageTitle').text($(this).data('name'))
    //     self.close_editor();
    //     //self.current_page_pk = $(this).data('pk')
    //     self.$page.attr('src', $(this).data('url'))

    //     // e.stopPropagation();
    //     // return true;
    // });


    // $(window).resize(function() {
    //     self.$page.height($(window).height()-53);
    //     self.$editor.height($(window).height()-93);
    // });
    // $(window).resize();
};


Editor.prototype.close_menu = function($elm, e) {
    var cm = $('#context-menu');
    cm.fadeOut(150);

}

Editor.prototype.size_editor = function(width, self) {
    self = this;

    self.$editor.stop().animate({ left: 0, width: width }, function() {

    });
    self.$page.contents().find('body').animate({ zoom: 0.8  });
    self.$main.stop().animate({ marginLeft: width  });
}

Editor.prototype.open_form = function(instance, title, minWidth, callback, form, $modal, self) {

    self = this;

    form = {}
    form.$form = $('<div class="__sections__ element-editor"></div>');
    form.$tabs = $('<ul class="nav nav-tabs"></ul>').appendTo(form.$form);
    form.$contents = $('<div class="tab-content" ></div>').appendTo(form.$form);
    form.current_tabs = {}


    form.add_tab = function(name, content, callback) {
        var title = self.tabs[name];
        if(!title) {
            title = name.substr(0, 1).toUpperCase() + name.substr(1);//self.editor.tabs['styles'];
        }
        if(!form.current_tabs[title]) {

            var rand = new Date().getTime();
            var $tab = $('<li class=""><a href="#section-element-'+rand+'-'+name+'">'+title+'</a></li>')
            form.$tabs.append($tab)
            var $content = $('<div class="tab-pane" id="section-element-'+rand+'-'+name+'"></div>');

            form.current_tabs[title] = {
                tab: $tab,
                content: $content,
            };
            form.$contents.append($content);
        }
        else {

        }
        var tab = form.current_tabs[title];
        tab.content.append(content);
        if(callback) {
            callback();
        }
        return tab;

    }

    $( ".sections-modal" ).dialog( "destroy" );

    $modal = $('<div class="sections-modal __sections__">\
        <div class="sections-modal-content"></div>\
        <div class="sections-modal-foot">\
            <a class="pull-left cancel btn btn-sm btn-warning">Cancel</a>\
            <a class="pull-right save btn btn-sm btn-success ">Save</a>\
        <div>\
    <div>');

    // if(!form.$tabs.find('li.active')) {

    // }

    $modal.find('.sections-modal-content').append(form.$form);
    $modal.dialog({
        dialogClass: "__sections__",
        modal: true,
        title: title,
        //position: 'center',
        show: { effect: "fadeIn", duration: 300 },
        width: minWidth ? minWidth : 400,
        open: function(event, ui) {
            $('.ui-widget-overlay').bind('click', function(){
                instance.cancel();
                $modal.dialog('close');
            });
        },
        resizable: true,
        position: { my: "center top", at: "center bottom", of: window }
    });
    $modal.on('click', 'a.save', function() {
        instance.save();
        $modal.dialog('close')
    })
    $modal.on('click', 'a.cancel', function() {
        instance.cancel();
        $modal.dialog('close')
    })
    $modal.on('click', ".nav-tabs a",  function (e) {
        e.preventDefault();
        $(this).parents('.nav-tabs').eq(0).find('li').removeClass('active');
        $(this).parent().addClass("active");

        var $target = $($(this).attr('href'))
        console.log($target)
        $target.parent().find('.tab-pane').removeClass('active');
        $target.addClass("active");
        e.stopPropagation();
        return false;
    });
    form.$modal = $modal;

    instance.set_form(form);
    form.$tabs.find('li').eq(0).addClass('active');
    form.$contents.find('> div').eq(0).addClass('active');
    //$modal.dialog( "refresh" );
    //$modal.dialog( "option", "position", $modal.dialog( "option", "position" ) );
    $('.ui-dialog').css({
        top: 150 //($(window).height() - $modal.height()) / 2
    })
};

Editor.prototype.close_editor = function(self) {

    // $('#editor').stop().animate({ left: -350, width: 350 }, function() {
    //     $('#editor').empty();
    // });
    // $('#page').contents().find('body').animate({ zoom: 1 });
    // $('#main').stop().animate({ marginLeft: 0 });
};

Editor.prototype.postJSON = function(url, data, success, self) {
    self = this;
    $.ajax({
        method: 'POST',
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        headers: {'content-type': 'application/json'},
        success: success
    });
}



// Editor.prototype.insert_template = function($template, self) {
//     self = this
//     if(self.current_page) {
//         new Section(self.current_page, $template.data('pk') );
//     }
// };
// Editor.prototype.open_templates = function(self) {
//     self = this;
//     self.close_editor();
//     self.$templates.stop().animate({ width:400 });
//     self.$page.contents().find('body').animate({ zoom: 0.5 });
//     self.$page_container.stop().animate({ paddingLeft:410 });
// };
// Editor.prototype.close_templates = function(self) {
//     self = this;
//     self.$templates.stop().animate({ width:0 });
//     self.$page.contents().find('body').animate({ zoom: 1 });
//     self.$page_container.stop().animate({ paddingLeft:0 });
// };


$(document).ready(function(editor, DATA, IFRAME, TEMPLATES, SIDEBAR, PAGES, drop_trigger_count, SECTION_INIT, SECTIONS, SECTION_COUNT, TOSUBMIT) {

    editor = PageEditor;

    // var min = 300;
    // var max = 3600;
    // var mainmin = 200;
    // $('#split-bar').mousedown(function (e) {
    //     e.preventDefault();
    //     $(document).mousemove(function (e) {
    //         e.preventDefault();
    //         var x = e.pageX - $('#sidebar').offset().left;
    //         if (x > min && x < max && e.pageX < ($(window).width() - mainmin)) {
    //           $('#sidebar').css("width", x);
    //           $('#main').css("margin-left", x);
    //         }
    //         e.stopPropagation();
    //     })
    // });
    // $(document).mouseup(function (e) {
    //     $(document).unbind('mousemove');
    // });


    $(document).on("mouseenter",".__sections__ .dropdown-menu > li > a.trigger", function(e){
        var current=$(this).next();
        var grandparent=$(this).parent().parent();
        if($(this).hasClass('left-caret')||$(this).hasClass('right-caret'))
            $(this).toggleClass('right-caret left-caret');
        grandparent.find('.left-caret').not(this).toggleClass('right-caret left-caret');
        grandparent.find(".sub-menu:visible").not(current).hide();
        current.toggle();
        e.stopPropagation();
    });
    $(document).on("mouseenter",".__sections__ .dropdown-menu > li > a:not(.trigger)", function(){
        var root=$(this).parents('.dropdown-menu').eq(0);
        root.find('.left-caret').toggleClass('right-caret left-caret');
        root.find('.sub-menu:visible').hide();
    });

    // $(document).on('click', ".__sections__ .nav-tabs a",  function (e) {
    //     e.preventDefault();
    //     $(this).parents('.nav-tabs').eq(0).find('li').removeClass('active');
    //     $(this).parent().addClass("active");

    //     var $target = $($(this).attr('href'))
    //     console.log($target)
    //     $target.parent().find('.tab-content').removeClass('active');
    //     $target.addClass("active");
    //     e.stopPropagation();
    //     return false;
    // })







    $.fn.addLoadingFull();
    PageEditor.init();
    $.fn.removeLoadingFull();

});












$(document).ready(function(CREATE_INIT, CROP_INIT, editor) {


    editor = PageEditor;

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