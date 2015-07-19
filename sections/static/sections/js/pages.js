
function pages_init(editor) {

    $.get('/admin/sections/editor/pages/', null, function(data) {

        //console.log('PAGES', document.location.href, data)
        new Page({
            pages: data,
            editor: editor
        }, true);

        editor.$pagesMenu.on('click', '>.pages-add', function(e) {
            page_create(editor)
            e.stopPropagation();
            return false;
        });
    });

    editor.$pagesMenu.find('>ul').sortable({
        items: 'li.item',
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
}

function page_create(editor, parent) {
    var page_name = prompt('Page name')
    if(page_name && $.trim(page_name) != "") {

        editor.postJSON('/admin/sections/editor/page/create/', {
            name: page_name,
            parent: parent.pk
        }, function(data) {
            console.log(data)
            data.parent = parent
            data.editor = editor
            new Page(data)
        });
    }

}


function page_reorder(pages) {
    orders = []
    $(ui.item.parent()).find('>li>a.trigger').each(function(i) {
        orders.push({
            pk: $(this).data('pk'),
            order: i
        });
    });
    editor.postJSON('/admin/sections/editor/pages/reorder/', orders, function(data) { })
}


function Page(data, root, self) {
    self = this;
    self.parent = data.parent;
    self.editor = data.editor;
    self.is_default = data.is_default;
    self.sections = [];
    self.pages = [];
    self.url = data.url;
    self.$selected_section = $.noop();
    self.root = root;

    console.log('PAGE INIT', self)



    self.init(data);
    if(self.root) {
        self.$menuItem = self.editor.$pagesMenu
    }
    else {
        self.$menuItem = $('\
            <li class="item '+(self.root ? 'dropdown' : '') +'">\
                <a data-pk="'+self.pk+'" class="trigger" href="'+self.url+'" \
                    '+(!self.root && data.pages && data.pages.length ? 'right-caret' : '') +'" >\
                    '+self.name+'\
                </a>\
                '+(self.root ? '<span class="dropdown-arrow"></span>' : '') +'\
                <ul class="dropdown-menu '+(self.root ? '' : 'sub-menu') +'">\
                    <li class="separator"></li>\
                    <li class="add">\
                        <a class="">\
                            <span class="fui-plus"></span>\
                        </a>\
                    </li>\
                </ul>\
            </li>');

        self.editor.pages[self.url] = self;
        if(self.parent) {
            self.parent.$menuItem.find('>ul>li.separator').before(self.$menuItem);
            self.parent.pages.push(self);
        }
        else {
            self.editor.$pagesMenu.find('>ul>li.separator').before(self.$menuItem);
            // self.editor.$pagesMenu.append(self.$menuItem);
            // self.editor.$pagesMenu.find('>ul>li').eq(-1).after(self.editor.$pagesMenu.find('>li.separator'));
        }
    }

    self.$menuItem.on('click', '> ul > li.add a', function(e) {
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


    //var path = document.location.href.replace(/^http\:\/\/.+\//i, '') + '/';
    //console.log(window.__sections__current_page, self.pk)
    if(window.__sections__current_page == self.pk) {
        self.editor.current_page = self;
        self.load()
    }
}

Page.prototype.init = function(data, self) {
    self = this;
    self.pk = data.pk;
    self.name = data.name;
    self.url = data.url;
};

Page.prototype.full_name = function(self) {
    self = this;
    if(self.parent && !self.parent.root) {
        return self.parent.full_name() + ' > ' + self.name
    }
    else {
        return self.name
    }
};

Page.prototype.load = function(callback, self) {
    self = this;
    self.sections = [];
    self.editor.$pagesMenu.find('>a').html(self.full_name()+' <b class="caret"></b>');
    //self.$page = self.editor.$page.contents();
    $('[data-section]').each(function() {

        new Section({ page: self, $section: $(this) });

    });
    // if(self.load_callback) {
    //     self.load_callback(self);
    //     self.load_callback = null;
    // }
    // self.$page.sortable({
    //     items: '[data-section]',
    //     dropOnEmpty: false,
    //     //revert: true,
    //     iframeFix: true,
    //     placeholder: "ui-state-highlight"

    // }).disableSelection();
    // self.$page.trigger('sortreceive');
}
Page.prototype.cancel = function(self) {
    self = this;

}

Page.prototype.save = function(callback, self) {
    self = this
    if(self.form) {
        data = {
            pk: self.pk,
            parent: self.parent ? self.parent.pk : null,
            name: self.form.find('input').val(),
        }
        $.ajax({
            method: 'POST',
            url: '/admin/sections/editor/page/'+(self.pk ? 'update' : 'create')+'/',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            success: function(data) {
                self.init(data);
            }
        });
    }

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
Page.prototype.reorder_sections = function(kwargs, orders, self) {
    self = this;
    orders = []
    $('[data-section]').each(function(i) {
        orders.push({
            pk: $(this).data('section'),
            order: i
        });
        //kwargs.section.order = i;
        //kwargs.$editor.find('h3 span').eq(1).text(i);
    });
    console.log(orders)
    $.ajax({
        method: 'POST',
        url: '/admin/sections/editor/sections/reorder/',
        data: JSON.stringify(orders),
        contentType: 'application/json; charset=utf-8',
        headers: {'content-type': 'application/json'},
        success: function(data) {
            // self.editor.$pages_menu.find('a[data-pk='+self.pk+']').parent().remove();
            // self.editor.$pages_menu.find('a[data-pk]').eq(0).click();
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
Page.prototype.set_form = function(form, callback, self) {
    self = this;

    var $content = $('<div >\
        <input value="'+self.name+'"/>\
    </div>');
    form.add_tab('Page', $content);
    self.form = $content;
}

