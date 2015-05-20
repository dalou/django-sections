

function Section(page, $section_or_template, self) {
    self = this;

    self.page = page;
    self.editor = page.editor;
    if(!$section_or_template.context) {
        self.create($section_or_template)
    }
    else {
        self.load($section_or_template)
    }
}

Section.prototype.load = function($section, self) {
    self = this;
    self.$section = $section;
    self.$section[0].section = self;
    self.elements = {};
    self.pk = $section.data('section');
    self.order = $section.data('section-order');
    self.data = {}

    self.$editor = $('<div class="section-editor">\
        <a href="#" class="close"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>\
        <h3><span class="fui-new"></span> Section <span>'+self.order+'</span></h3>\
        <div class="editor-section-actions">\
            <button type="button" class="up btn btn-inverse"><span class="fui-triangle-up"></span></button>\
            <button type="button" class="down btn btn-inverse"><span class="fui-triangle-down"></span></button>\
            <button type="button" class="target btn btn-primary"><span class="fui-eye"></span></button>\
            <button type="button" class="delete btn btn-danger"><span class="fui-trash"></span></button>\
        </div><hr />\
    </div>').hide();

    self.editor.$editor.append(self.$editor)

    self.$editor.on('click', '.editor-section-actions button.up', function(e) {
        self.$section.prev('[data-section]').before(self.$section);
        self.page.reorder_sections();
        self.target();
    });
    self.$editor.on('click', '.editor-section-actions button.down', function(e) {
        self.$section.next('[data-section]').after(self.$section);
        self.page.reorder_sections();
        self.target();
    });
    self.$editor.on('click', '.editor-section-actions button.delete', function(e) {
        if(confirm('Delete this section ?')) {
            self.remove();
        }
    });
    self.$editor.on('click', '.editor-section-actions button.target', function(e) {
        self.target();
    });

    self.$editor.on('click', 'a.close', function(e) {
        self.close_editor();
    });



    self.$section.on('click', function(e) {
        self.open_editor();
    });

    self.$section.on('mouseenter', function(e) {
        $section.css({
            border: '3px red dashed'
        })
    });
    self.$section.on('mouseleave', function(e) {
        $section.css({
            border: ''
        });
    });
    self.$section.on('mouseenter', '[data-element]', function(e) {
        $(this).css({
            outline: 'red dashed 3px',
            cursor: 'pointer'
        })
        e.stopPropagation();
        return false;
    });
    self.$section.on('mouseleave', '[data-element]', function(e) {
        $(this).css({
            outline: '',
            cursor: ''
        })
        e.stopPropagation();
        return false;
    });

    if(self.$section.data('element')) {
        new Element(self, self.$section);
    }
    self.$section.find('[data-element]').each(function(e) {
        new Element(self, $(this));
    });


    // self.$section.on('click', '[data-element]', function(e) {

    //     self.open_editor($(this), $section);

    //     e.stopPropagation();
    //     return false;
    // });
}
Section.prototype.create = function(template, callback, self) {
    self = this;
    var data = {
        page: self.page.pk,
        template: template,
        data: {}
    }
    $.ajax({
        method: 'POST',
        url: '/admin/sections/editor/section/update/',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        headers: {'content-type': 'application/json'},
        success: function(data) {
            console.log(data)
            self.page.reload(function(page) {
                console.log('RELOAD', page)
            });
        }
    });
}
Section.prototype.update = function(callback, self) {
    self = this;
    var data = {
        section: self.pk,
        data: self.to_data()
    }
    $.ajax({
        method: 'POST',
        url: '/admin/sections/editor/section/update/',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        headers: {'content-type': 'application/json'},
        success: function(data) {
            console.log(data)
            if(callback) {
                self.page.reload(callback)
            }
        }
    });

}
Section.prototype.target = function(self) {
    self = this;
    $.smoothScroll({
        scrollTarget: self.$section
    });
    self.$section.parents('html,body').animate({scrollTop: self.$section.offset().top},'slow');
}
Section.prototype.remove = function(self) {
    self = this
    $.ajax({
        method: 'POST',
        url: '/admin/sections/editor/section/remove/'+self.pk+'/',
        success: function(data) {
            var index = self.page.sections.indexOf(self)
            if (index > -1) {
                self.$section.remove();
                self.$editor.remove();
                self.page.sections.splice(index, 1);
            }
        }
    });
}

Section.prototype.open_editor = function(self) {
    self = this;
    self.editor.open_editor();
    self.$editor.show();
};

Section.prototype.close_editor = function(self) {
    self = this;
    self.editor.close_editor();
};

Section.prototype.to_data = function(reload, data, self) {
    self = this;
    data = {}
    for(var i in self.elements) {

        var element = self.elements[i];
        var name = element.name;
        data[name] = element.to_data();

        // if(name) {

        //     if(element.container) {
        //         if(!data[element.container].container) {
        //             data[element.container].container = []
        //         }
        //         data[element.container].container.push(element.data)
        //     }
        //     else {
        //         data[name] = element.data
        //     }
        // }

    }
    return data;

}
