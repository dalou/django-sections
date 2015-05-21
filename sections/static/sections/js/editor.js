// var sections_plugins = []

function TemplateCategory(editor, data, self) {
    self = this;
    self.editor = editor;
    self.pk = data.pk;
    self.name = data.name;
    self.templates = []
    self.$menuItem = $('<li>\
        <a data-pk="'+self.pk+'" class="trigger">'+self.name+'</a>\
    </li>');
    self.$menuItem.on('click', 'a.trigger', function(e) {

        $.fn.addLoadingFull();
        self.editor.$templates.empty().html('\
            <a href="#" class="close">\
                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>\
            </a>\
            <h3><span class="fui-list"></span> Templates</h3>\
            <ul></ul>')
        self.templates = [];
        $.get('/admin/sections/editor/templates/'+self.pk+'/', null, function(data) {

            for(var i in data) {
                self.templates.push(new Template(self, data[i]));
            }
            self.editor.open_templates();
            $.fn.removeLoadingFull();
        });
    });
    self.$menuItem.appendTo(self.editor.$templates_menu.find('.editor-template-menu'))
}

function Template(category, data, self) {
    self = this;
    self.category = category;
    self.editor = category.editor;
    self.pk = data.pk;
    self.name = data.name;
    self.$template = $('\
        <li class="template" data-pk="'+self.pk+'" >\
            <img src="'+data.image+'" alt="{{ template.name }}">\
            <div class="editor-template-actions">\
                <button type="button" class="insert btn btn-danger btn-sm"><span class="fui-plus"></span></button>\
            </div>\
        </li>');
    self.$template.appendTo(self.editor.$templates.find('ul'))
}

Template.prototype.edit = function(self) {
    self = this;
    self.editor.$editor.empty();
    self.editor.$editor.html('\
        <div class="element-editor"><h3><span class="fui-new"></span>Template editor</h3>\
            <ul class="nav nav-tabs">\
                <li class="active">\
                    <a href="#editor-tab-1"><span class="fui-new"></span> Code</a>\
                </li>\
                <li class="">\
                    <a href="#editor-tab-2"><span class="fui-new"></span> Preview</a>\
                </li>\
                <li class="">\
                    <a href="#editor-tab-3"><span class="fui-new"></span> Screenshot</a>\
                </li>\
            </ul>\
            <div class="tab-content" id="#editor-tab-1"></div>\
            <div class="tab-content" id="#editor-tab-2"></div>\
            <div class="tab-content" id="#editor-tab-3"></div>\
        </div>');

    self.editor.open_editor('90%')
}


function Editor(self) {
    self = this;

    self.$pages_menu_url = '/admin/sections/editor/pages/menu/'
    self.section_url = '/admin/sections/editor/section/'
    self.page_url = '/admin/sections/editor/page/'
    self.page_infos_url = '/admin/sections/editor/page/'
    self.element_url = '/admin/sections/editor/element/'
    self.element_url = '/admin/sections/editor/element/'
    self.current_page = null;

    self.values = [];
    self.styles = [];
    self.tabs = [];
    self.inputs = [];

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

Editor.prototype.open_editor = function(self) {
    self = this;
    self.close_templates();
    self.$editor.find('.section-editor').hide();
    self.$editor.find('.element-editor').hide();
    self.$editor.stop().animate({ left:0 });
    self.$page_container.stop().animate({ paddingLeft:310 });
};
Editor.prototype.close_editor = function(self) {
    self = this;
    self.$editor.find('.section-editor').hide();
    self.$editor.find('.element-editor').hide();
    self.$editor.stop().animate({ left:-300 });
    self.$page_container.stop().animate({ paddingLeft:0 });
};

Editor.prototype.init = function(data, self) {
    self = this;

    self.$section_action = $('#section-actions')
    self.$page_container = $('#page-container');
    self.$page = $('#page');
    self.$pages_menu = $('#editor-pages-menu');
    self.$templates = $('#templates')

    self.load_templates();

    /************** EDITOR ***************/

    self.$editor = $('#editor')
    self.$editor.find('>.close').click(function() {
        self.close_editor();
    })


    /************** TEMPLATES ***************/
    self.$templates.on('click', 'a.close', function(e) {
        self.close_templates();
    });
    self.$templates.on('click', 'button.insert', function(e) {
        self.insert_template($(this).parent().parent());

    });
    self.$templates.on('click', 'button.thumbnail', function(e) {
        self.template_screenshot($(this).parent().parent())
    });
    self.$templates_menu = $('#editor-templates-menu')


    /************** PAGES ***************/
    self.$page.load(function() {

        self.close_editor();
        self.close_templates();
        self.$editor.empty();

        var page = new Page(self, self.$page);
        if(self.page_load_callback) {
            self.page_load_callback(page)
            self.page_load_callback = null;
        }
        $.fn.removeLoadingFull();
    });

    $('#page-container button.page-delete').on('click', function() {
        self.current_page.remove();
    })

    self.$pages_menu.find('ul').each(function() {
        $(this).sortable({
            items: 'li.editor-page-menu',
            //handle: "> li a",
            tolerance: "pointer",
            containment: 'parent',
            update: function(event, ui, orders) {
                orders = []
                $(ui.item.parent()).find('>li>a.trigger').each(function(i) {
                    orders.push({
                        pk: $(this).data('pk'),
                        order: i
                    });
                });

                $.ajax({
                    method: 'POST',
                    url: '/admin/sections/editor/pages/reorder/',
                    data: JSON.stringify(orders),
                    contentType: 'application/json; charset=utf-8',
                    headers: {'content-type': 'application/json'},
                    success: function(data) {
                    }
                });
            }
        });
    });
    self.$pages_menu.on('click', '.editor-pages-add', function(e) {
        var page_name = prompt('Page name')
        if(page_name && $.trim(page_name) != "") {
            self.update_page({
                name: page_name,
                parent: $(this).data('parent')
            })
        }
        e.stopPropagation();
        return false;
    });
    self.$pages_menu.on('click', 'a.trigger', function(e) {

        $.fn.addLoadingFull();
        $('#pageTitle').text($(this).data('name'))
        self.close_editor();
        //self.current_page_pk = $(this).data('pk')
        self.$page.attr('src', $(this).data('url'))

        // e.stopPropagation();
        // return true;
    });
    self.$pages_menu.find('a.trigger').eq(0).click()


    $(window).resize(function() {
        self.$page.height($(window).height()-123);
    });
    $(window).resize();
};


Editor.prototype.load_templates = function(self) {
    self = this;
    $.get('/admin/sections/editor/templates/categories/', null, function(data) {
        for(var i in data) {
            new TemplateCategory(self, data[i]);
        }
    })

}

Editor.prototype.update_page = function(data, reload, self) {
    self = this
    $.ajax({
        method: 'POST',
        url: '/admin/sections/editor/page/update/',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            self.$pages_menu.find('> ul').eq(0).replaceWith(data)
        }
    });
};


Editor.prototype.insert_template = function($template, self) {
    self = this
    if(self.current_page) {
        new Section(self.current_page, $template.data('pk') );
    }
};
Editor.prototype.template_screenshot = function($template, ifr, self) {
    self = this

    $template.addLoading();
    ifr = $('<iframe></iframe>').css({ width: '1200', zIndex: 1, position: "fixed", left: -9999, top: -9999 })
    $('body').append(ifr);
    ifr.attr('src', '/admin/section/editor/template/screenshot/'+$template.data('pk')+'/')
        .on('load', function(self) {
        self = $(this);
        ifr.height(ifr.contents().height());
        setTimeout(function() {
            html2canvas(self.contents().find('html')).then(function(canvas) {
                dataURL = canvas.toDataURL("image/png");
                $.post('/admin/section/editor/template/screenshot/'+$template.data('pk')+'/', { base64: dataURL }, function(data) {

                    $template.find('img').attr('src', data);
                    $template.removeLoading();
                    ifr.remove()
                })
            });
        }, 5000);
    });
}
Editor.prototype.open_templates = function(self) {
    self = this;
    self.close_editor();
    self.$templates.stop().animate({ width:400 });
    self.$page_container.stop().animate({ paddingLeft:410 });
};
Editor.prototype.close_templates = function(self) {
    self = this;
    self.$templates.stop().animate({ width:0 });
    self.$page_container.stop().animate({ paddingLeft:0 });
};


$(document).ready(function(editor, DATA, IFRAME, TEMPLATES, SIDEBAR, PAGES, drop_trigger_count, SECTION_INIT, SECTIONS, SECTION_COUNT, TOSUBMIT) {


    $(function(){
        $(document).on("mouseenter",".dropdown-menu > li > a.trigger", function(e){
            var current=$(this).next();
            var grandparent=$(this).parent().parent();
            if($(this).hasClass('left-caret')||$(this).hasClass('right-caret'))
                $(this).toggleClass('right-caret left-caret');
            grandparent.find('.left-caret').not(this).toggleClass('right-caret left-caret');
            grandparent.find(".sub-menu:visible").not(current).hide();
            current.toggle();
            e.stopPropagation();
        });
        $(document).on("mouseenter",".dropdown-menu > li > a:not(.trigger)", function(){
            var root=$(this).parents('.dropdown-menu').eq(0);
            root.find('.left-caret').toggleClass('right-caret left-caret');
            root.find('.sub-menu:visible').hide();
        });
    });
    $(document).on('click', ".nav-tabs a",  function (e) {
      e.preventDefault();
      $(this).tab("show");
    })

    $.fn.addLoadingFull();
    PageEditor.init();
    $.fn.removeLoadingFull();

});