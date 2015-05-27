
function page_create(editor, parent) {

    var page_name = prompt('Page name')
    if(page_name && $.trim(page_name) != "") {
        var page = new Page({ editor: editor, name: page_name, parent: parent });
        page.update();
    }
}


function page_reorder(pages) {
    page.$menuItem
}


function Page(data, self) {
    self = this

    self.editor = data.editor;
    self.parent = data.parent;
    self.pk = data.pk;
    self.name = data.name;
    self.url = data.url;
    self.sections = [];
    self.pages = [];
    self.$selected_section = $.noop();

    //self.url = self.$page_iframe.contents().get(0).location.pathname
    //self.$page_menu = self.editor.$pages_menu.find('[data-url="'+self.url+'"]')


    self.$menuItem = $('\
        <li class="editor-page-menu">\
            <a class="trigger '+(data.pages && data.pages.length ? 'right-caret' : '') +'" >'+self.name+'</a>\
            <ul class="editor-pages-menu dropdown-menu sub-menu">\
                <li class="pages-add">\
                    <a class="">\
                        <span class="fui-plus"></span>\
                    </a>\
                </li>\
            </ul>\
        </li>')

    self.$menuItem.on('click', 'a.trigger', function(e) {
        self.open();
        self.editor.close_editor();
        $('#page_root').parent().removeClass('open')
        e.stopPropagation();
    })
    self.$menuItem.on('click', '> ul > li.pages-add a', function(e) {
        page_create(self.editor, self);
        e.stopPropagation();
    })

    //$('#pageTitle').text(self.$page_menu.data('name') + ' (id: '+self.pk+')')

    // self.$page.find('[data-section]').each(function() {

    //     self.sections.push(new Section(self, $(this)));

    // });
    // self.$page.click(function() {
    //     $('nav .dropdown').removeClass('open');
    // });

    self.editor.pages[data.url] = self;
    if(self.parent) {
        self.parent.$menuItem.find('>ul').append(self.$menuItem);
        self.parent.$menuItem.find('>ul>li').eq(-1).after(self.parent.$menuItem.find('>ul>li.pages-add'));
        self.parent.pages.push(self);
    }
    else {
        self.editor.$pagesMenu.append(self.$menuItem);
        self.editor.$pagesMenu.find('>li').eq(-1).after(self.editor.$pagesMenu.find('>li.pages-add'));
    }

    if(data.pages) {
        for(var i in data.pages) {
            var page_data = data.pages[i];
            page_data.editor = self.editor;
            page_data.parent = self;
            var page = new Page(page_data);
        }
    }
};
Page.prototype.open = function(callback, self) {
    self = this;
    self.loadMenu();
    self.editor.$page.attr('src', self.url)
}
Page.prototype.update = function(callback, self) {
    self = this
    data = {
        pk: self.pk,
        parent: self.parent ? self.parent.pk : null,
        name: self.name,
    }
    $.ajax({
        method: 'POST',
        url: '/admin/sections/editor/page/'+(self.pk ? 'update' : 'create')+'/',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            self.name = data.name;
            self.pk = data.pk;
            self.url = data.url;
            self.reload();
        }
    });

}
Page.prototype.loadMenu = function(self){
    self = this;
    document.location.hash = self.url
    $('#page_root').html(self.name+ '  <b class="caret"></b>');
    $('#current_page_infos').empty().append(self.get_page_menu());

}
Page.prototype.reload = function(callback, self) {
    self = this;
    // self.editor.close_editor();
    // self.editor.$editor.empty();
    if(callback) {
        self.load_callback = callback
    }
    console.log('page reload')
    self.editor.$page.attr('src', self.url + '?rand='+ (new Date().getTime()))

}
Page.prototype.insert_section = function(kwargs, self) {
    self = this;
    kwargs = {}
    kwargs.$editor = $('\
        <div class="editor-element">\
            <h3><span class="fui-list-small-thumbnails"></span> Insert section</h3>\
            <ul class="template-categories"></ul>\
            <ul class="templates"></ul>\
        </div>');
    for(var i in self.editor.templates) {
        var category = self.editor.templates[i]
        var $category = category.get_editor();
        kwargs.$editor.find('.template-categories').append($category);
        for(var j in category.templates) {
            var $template = category.templates[j].get_item().hide()
            kwargs.$editor.find('.templates').append($template)
        }
        $category.on('click', 'a', function() {
            kwargs.$editor.find('.templates .template').hide()
            kwargs.$editor.find('.templates .category-'+$(this).data('pk')).show()
            self.editor.size_editor(500);
            //kwargs.$editor.find('.templates').css()
        })
    }
    kwargs.$editor.find('.dropdown-menu li a').eq(0).click()
    // $editor.find('>.isotopes').isotope({
    //     items: '.isotope'
    // })
    self.editor.open_editor(kwargs.$editor, 200)
}
Page.prototype.load = function(callback, self) {
    self = this;
    self.sections = [];
    self.loadMenu();
    self.$page = self.editor.$page.contents();
    self.$page.find('[data-section]').each(function() {

        new Section({ page: self, $section: $(this) });

    });
    if(self.load_callback) {
        self.load_callback(self);
        self.load_callback = null;
    }
    // self.$page.sortable({
    //     items: '[data-section]',
    //     dropOnEmpty: false,
    //     //revert: true,
    //     iframeFix: true,
    //     placeholder: "ui-state-highlight"

    // }).disableSelection();
    // self.$page.trigger('sortreceive');
}
Page.prototype.reorder_sections = function(kwargs, self) {
    self = this;
    kwargs.orders = []
    self.$page.find('[data-section]').each(function(i) {
        kwargs.orders.push({
            pk: $(this).data('section'),
            order: i
        });
        kwargs.section.order = i;
        kwargs.$editor.find('h3 span').eq(1).text(i);
    });
    console.log(kwargs.orders)
    $.ajax({
        method: 'POST',
        url: '/admin/sections/editor/sections/reorder/',
        data: JSON.stringify(kwargs.orders),
        contentType: 'application/json; charset=utf-8',
        headers: {'content-type': 'application/json'},
        success: function(data) {
            self.editor.$pages_menu.find('a[data-pk='+self.pk+']').parent().remove();
            self.editor.$pages_menu.find('a[data-pk]').eq(0).click();
        }
    });
}
Page.prototype.remove = function(self) {
    self = this
    $.ajax({
        method: 'POST',
        url: '/admin/sections/editor/page/remove/'+self.pk+'/',
        success: function(data) {
            if(confirm('Delete this page ?')) {
                self.$menuItem.remove()
                self.editor.$pagesMenu.find('a').eq(0).click();
            }
        }
    });
}



Page.prototype.get_page_menu = function(callback, self) {
    self = this;

    $('#add_section').empty();
    $menu = $('<a class="insert-section"><span class="fui-plus-circle"></span> Insert new section</a>')
    $('#add_section').append($menu)

    $menu.on('click', function() {
        console.log('hu')
        self.insert_section();
    })
    return $menu;
}
Page.prototype.get_editor = function(callback, self) {
    self = this;
    var $editor = $('\
        <div class="editor-element">\
            <h3>Pages : '+self.name+'</h3>\
            <div><input value="'+self.name+'"/></div>\
            <div class="clearfix"></div>\
        </div>');
    return $editor;
}

