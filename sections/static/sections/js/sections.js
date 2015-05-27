

function Section(data, self) {
    self = this;

    self.page = data.page;
    self.template = data.template;
    self.$section = data.$section;
    self.pk = self.$section ? self.$section.data('section') : null;
    self.order = self.$section ? self.$section.data('section-order') : 0;
    self.editor = self.page.editor;
    self.elements = {};

    self.$selected_element = null;
    self.data = {}

    self.page.sections.push(self)

    if(self.$section) {
        self.$section[0].section = self;

        self.$section.on('mouseenter', function(e) {
            $(this).css({
                border: '3px red dashed'
            })
        });
        self.$section.on('mouseleave', function(e) {
            $(this).css({
                border: ''
            });
        });

        self.$section.on('click', function(e)
        {
            self.editor.open_editor(self.get_editor());
        });
        self.$section.on('click', 'a', function(e)
        {
            self.propagate = true;
            return true;
        });

        if(self.$section.data('element')) {
            new Element({
                section: self,
                $element: self.$section
            });
        }
        self.$section.find('[data-element]').each(function() {
            new Element({
                section: self,
                $element: $(this)
            });
        });
    }

    // self.$section.find('[data-element]').addBack('[data-element]').on('click', function(e)
    // {
    //     console.log('ELEMENT CLICK')
    //     self.editor.open_editor(self.get_element_editor($(this)));

    //     if(!self.propagate) {
    //         e.stopPropagation();
    //     }
    //     self.propagate = false;
    //     e.preventDefault();
    //     e.stopPropagation();
    // });


    // self.$section.on('click', '[data-element]', function(e) {

    //     self.open_editor($(this), $section);

    //     e.stopPropagation();
    //     return false;
    // });
}



Section.prototype.update = function(callback, self) {
    self = this;
    var data = self.pk ? {
        pk: self.pk,
        page: self.page.pk,
        data: self.to_data()
    } : {
        page: self.page.pk,
        template: self.template,
        data: {}
    }
     console.log('SECTION BEFORE UPDATE', data)
    $.ajax({
        method: 'POST',
        url: '/admin/sections/editor/section/'+(self.pk ? 'update' : 'create')+'/',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        headers: {'content-type': 'application/json'},
        success: function(data) {
            console.log('SECTION UPDATED', data)
            if(!self.pk) {
                self.page.reload(function(page) {
                    page.sections[page.sections.length-1].target()
                })
            }
        }
    });

}
Section.prototype.target = function(self) {
    self = this;
    // $.smoothScroll({
    //     scrollTarget: self.$section
    // });
    self.$section.parents('html,body').animate({scrollTop: self.$section.offset().top},'slow');
}
Section.prototype.remove = function(self) {
    self = this
    if(confirm('Delete this section ?')) {
        self.editor.postJSON(
            '/admin/sections/editor/section/remove/',
            { pk: self.pk },
            function(data) {
                var index = self.page.sections.indexOf(self)
                if (index > -1) {
                    self.$section.remove();
                    self.page.sections.splice(index, 1);
                }
            }
        );
    }
}



Section.prototype.to_data = function(reload, data, data_by_key, self) {
    self = this;
    data = {}
    for(var i in self.elements) {
        data[self.elements[i].name] = self.elements[i].to_data()
    }
    // self.$section.find('[data-element]').addBack('[data-element]').each(function(e) {

    //     var options = $(this).data('element')
    //     var keys = options.name.split('.');
    //     var name = keys.pop();

    //     var element = {
    //         styles: {}, values: {}
    //     }
    //     var types = ['styles', 'values']
    //     for(var i in types) {
    //         var type = types[i];
    //         if(options[type]) {
    //             var names = options[type].split(',')
    //             for(var i in names)  {
    //                 var value = self.get_element_value($(this), names[i], type);
    //                 if(value && $.trim(value != "")) {
    //                     element[type][names[i]] = value;
    //                 }
    //             }
    //         }
    //     }
    //     var container = data;
    //     if(keys.length > 1) {
    //         for(var i in keys) {
    //             var key = keys[i];
    //             container = container[key]
    //             if(! container.container ) {
    //                 container.container = [];
    //             }
    //             container = container.container
    //         }
    //         container.push(element);
    //     }
    //     else {
    //         container[name] = element;
    //     }
    // });
    return data;

}
Section.prototype.move_up = function(kwargs, self) {
    self = this;
    kwargs = {}
    self.$section.prev('[data-section]').before(self.$section);
    self.page.reorder_sections(kwargs);
    self.target();
}
Section.prototype.move_down = function(kwargs, self) {
    self = this;
    self.$section.next('[data-section]').after(self.$section);
    kwargs.section = self
    self.page.reorder_sections(kwargs);
    self.target();
}

Section.prototype.get_editor = function(template, callback, self) {
    self = this;

    var $editor = $('\
        <div class="editor-element">\
            <h3 class="pull-left"><span class="fui-new"></span> Section : <span>'+self.order+'</span></h3>\
            <div class="editor-section-actions pull-right">\
                <button type="button" class="up btn btn-xs btn-inverse"><span class="fui-triangle-up"></span></button>\
                <button type="button" class="down btn btn-xs btn-inverse"><span class="fui-triangle-down"></span></button>\
                <button type="button" class="target btn btn-xs btn-primary"><span class="fui-eye"></span></button>\
                <button type="button" class="delete btn btn-xs btn-danger"><span class="fui-trash"></span></button>\
            </div>\
            <div class="clearfix"></div>\
        </div>')
        .on('click', '.editor-section-actions button.up', function() { self.move_up({ $editor: $editor }); })
        .on('click', '.editor-section-actions button.down', function() { self.move_down({ $editor: $editor }); })
        .on('click', '.editor-section-actions button.delete', function() { self.remove({ $editor: $editor }); })
        .on('click', '.editor-section-actions button.target', function() { self.target({ $editor: $editor }); })
    $editor.prepend(self.page.get_editor())
    return $editor;
}

