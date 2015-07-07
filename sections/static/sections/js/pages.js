$(document).ready(function(editor, $pageFrame, $pageMenu) {

    editor = PageEditor;
    $pageFrame = $('#page');
    $pageMenu = $('#pages-menu');

    /* MENU MANAGER */
    $(document).on('click', '.page-menu a.trigger', function(e) {

        console.log('OPEN PAGE', $(this).parent().data())
        var data = $(this).parent().data()
        editor.current_page = data
        document.location.hash = data.url
        $('#page-root-menu').html(data.name+ '  <b class="caret"></b>').parent().removeClass('open');
        $('#page-settings-menu').html( $(this).parent().find('>.hidden').html() )
        $pageFrame.attr('src', data.url)
        editor.close_editor();
        e.stopPropagation();
    });

    /* ONLOAD PAGE */
    $pageFrame.load(function() {
        var url = $pageFrame.contents().get(0).location.pathname;
        var $current_page = $('editor-page-menu[data-url="'+url+'"]')
        if($current_page.length) {
            editor.current_page = $current_page.data();
            //self.pages[url].load();
        }
        else {
            editor.current_page = null;
        }
    });


    /* REORDER PAGES */
    $pageMenu.find('ul').each(function() {
        $(this).sortable({
            items: '>li.editor-page-menu',
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
                editor.postJSON('/admin/sections/editor/pages/reorder', orders, function(data) { })
            }
        });
    })

    /* ADD PAGE */
    $pageMenu.on('click', '>.pages-add', function(e) {
        var page_name = prompt('Page name')
        if(page_name && $.trim(page_name) != "") {

            editor.postJSON('/admin/sections/editor/page/create', {
                name: page_name,
                parent: $(this).data('parent')
            }, function(data) {
                console.log(data)
            });
        }
        e.stopPropagation();
        return false;
    });


});



function pages_init(editor, self) {
    self = editor;






    $.get('/admin/sections/editor/pages/', null, function(data) {

        root_page = new Page({
            pages: data,
            editor: self
        }, true)
        // for(var i in data) {
        //     var page_data = data[i];
        //     page_data.editor = self
        //     new Page(page_data);
        // }

        var hash = document.location.hash;
        console.log(hash)
        if(!hash) {
            root_page.pages[data[0].url].open();
        }
        else {
            var page = root_page.pages[hash.split('#')[1]]
            if(page) {
                page.open();
            }
            else {

            }

        }

        // self.$pagesMenu.on('click', '>.pages-add', function(e) {
        //     page_create(self)
        //     e.stopPropagation();
        //     return false;
        // });
    });
}
function page_create(editor, parent) {


}


function page_reorder(pages) {

}


function Page(data, root, self) {
    self = this;
    self.parent = data.parent;
    self.editor = data.editor;
    self.sections = [];
    self.pages = [];
    self.url = data.url;
    self.$selected_section = $.noop();
    self.root = root;

    self.init(data);
    if(self.root) {
        self.$menuItem = self.editor.$pagesMenu
    }
    else {
        self.$menuItem = $('\
            <li class="'+(self.root ? 'dropdown' : '') +'">\
                <a data-pk="'+self.pk+'" class="trigger \
                    '+(!self.root && data.pages && data.pages.length ? 'right-caret' : '') +'" >\
                    '+self.name+'\
                </a>\
                '+(self.root ? '<span class="dropdown-arrow"></span>' : '') +'\
                <ul class="dropdown-menu '+(self.root ? '' : 'sub-menu') +'">\
                    <li class="pages-add">\
                        <a class="">\
                            <span class="fui-plus"></span>\
                        </a>\
                    </li>\
                </ul>\
            </li>')
        self.$settingsMenuItem = $('\
            <li class="editor-page-settings-menu">\
                <a data-pk="'+self.pk+'" class="trigger">s</a>\
            </li>')
        self.$menuItem.on('click', 'a.trigger', function(e) {
            self.open();
            self.editor.close_editor();
            $('#page_root').parent().removeClass('open')
            e.stopPropagation();
        })

        self.editor.pages[self.url] = self;
        if(self.parent) {
            self.parent.$menuItem.find('>ul').append(self.$menuItem);
            self.parent.$menuItem.find('>ul>li').eq(-1).after(self.parent.$menuItem.find('>ul>li.pages-add'));
            self.parent.pages.push(self);
        }
        else {
            self.editor.$pagesMenu.append(self.$menuItem);
            self.editor.$pagesMenu.find('>ul>li').eq(-1).after(self.editor.$pagesMenu.find('>li.pages-add'));
        }
    }

    self.$menuItem.on('click', '> ul > li.pages-add a', function(e) {
        page_create(self.editor, self);
        e.stopPropagation();
    })

    if(data.pages) {
        for(var i in data.pages) {
            var page_data = data.pages[i];
            page_data.editor = self.editor;
            page_data.parent = self;
            var page = new Page(page_data);
        }
    }
}

Page.prototype.init = function(data, self) {
    self = this;
    self.pk = data.pk;
    self.name = data.name;
    self.url = data.url;
};
Page.prototype.open = function(callback, self) {
    self = this;
    self.loadMenu();
    self.editor.$page.attr('src', self.url)
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
            self.init(data);
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

