// var sections_plugins = []

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
    self.$templates_menu.on('click', 'a.trigger', function(e) {

        $.fn.addLoadingFull();
        $.get('/admin/sections/editor/templates/'+$(this).data('pk')+'/', null, function(data) {

            self.$templates.html(data)
            $.fn.removeLoadingFull();
            self.open_templates();

            self.$templates.find('.template').each(function() {
                if($(this).data('need-thumbnail')) {
                    self.template_screenshot($(this))
                }
            })
        });
    });

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
Editor.prototype.template_screenshot = function($template, self) {
    self = this

    $template.addLoading();
    ifr = $('<iframe></iframe>').css({ width: '1200', position: "fixed", left: -9999, top: -9999 })
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
                })
            });
        }, 3000);
    });
}
Editor.prototype.open_templates = function(self) {
    self = this;
    self.close_editor();
    self.$templates.stop().animate({ width:300 });
    self.$page_container.stop().animate({ paddingLeft:310 });
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