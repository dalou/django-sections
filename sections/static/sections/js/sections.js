

function Section(page, $section, self) {
    self = this;

    self.page = page;
    self.editor = page.editor;
    self.$section = $section;
    self.$section[0].section = self;
    self.elements = [];
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
        self.elements.push(new Element(self, self.$section));
    }
    self.$section.find('[data-element]').each(function(e) {
        self.elements.push(new Element(self, $(this)));
    });


    // self.$section.on('click', '[data-element]', function(e) {

    //     self.open_editor($(this), $section);

    //     e.stopPropagation();
    //     return false;
    // });
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


Section.prototype.update_data = function(reload, data, self) {
    self = this;

    data = {}
    for(var i in self.elements) {

        var element = self.elements[i];
        var name = element.options.name;

        if(name) {

            if(element.container) {
                if(!data[element.container].container) {
                    data[element.container].container = []
                }
                data[element.container].container.push(element.data)
            }
            else {
                data[name] = element.data
            }
        }

    }
    self.editor.update_section({
        section: self.$section.data('section'),
        data: data
    }, reload)

}

function moveUp(array, value, by) {
    var index = array.indexOf(value),
        newPos = index - (by || 1);

    if(index === -1)
        throw new Error("Element not found in array");

    if(newPos < 0)
        newPos = 0;

    array.splice(index,1);
    array.splice(newPos,0,value);
};
function moveDown(array, value, by) {
    var index = array.indexOf(value),
        newPos = index + (by || 1);

    if(index === -1)
        throw new Error("Element not found in array");

    if(newPos >= array.length)
        newPos = array.length;

    array.splice(index, 1);
    array.splice(newPos,0,value);
};

function Element(section, $element, self) {
    self = this


    self.section = section
    self.editor = section.editor;
    self.options = $element.data('element')
    self.data = {
        styles: {}, values: {}
    }
    self.current_tabs = {}
    self.$element = $element;
    self.$element[0].sections_element = self;

    var name = self.options.name;
    var keys = name.split('.');
    if(keys.length > 1) {
        self.container = keys[0];
        self.options.name = keys[1];

        self.$container = $('<div class="element-editor"><h3><span class="fui-new"></span> Container</h3>\
            <div class="editor-element-container-actions">\
                <button type="button" class="prev btn btn-inverse"><span class="fui-arrow-left"></span></button>\
                <button type="button" class="next btn btn-inverse"><span class="fui-arrow-right"></span></button>\
                <button type="button" class="add btn btn-primary"><span class="fui-plus"></span></button>\
                <button type="button" class="delete btn btn-danger"><span class="fui-trash"></span></button>\
            </div><hr />\
        </div>').hide();

        self.$container.on('click', '.editor-element-container-actions button.prev', function(e) {
            moveUp(self.section.elements, self)
            self.section.update_data(true)
        });
        self.$container.on('click', '.editor-element-container-actions button.next', function(e) {
            console.log(self.section.elements)
            moveDown(self.section.elements, self)
            console.log(self.section.elements)
            self.section.update_data(true)
        });
        self.$container.on('click', '.editor-element-container-actions button.delete', function(e) {
            if(confirm('Delete this section ?')) {
                var index = self.section.elements.indexOf(self)
                self.section.elements.splice(index, 1);
                self.section.update_data(true)
            }
        });
        self.$container.on('click', '.editor-element-container-actions button.add', function(e) {
            var $clone = self.$element.clone();
            self.section.elements.push(new Element(self.section, $clone))
            self.section.update_data(true)
        });

        self.section.$editor.append(self.$container);
    }


    self.$editor = $('<div class="element-editor"><h3><span class="fui-new"></span> Element</h3>\
                <ul class="nav nav-tabs"></ul>\
                <div class="tab-content" ></div></div>').hide();
    self.$tabs = self.$editor.find('ul.nav-tabs');
    self.$contents = self.$editor.find('div.tab-content');
    self.section.$editor.append(self.$editor);
    self.$element.on('click', 'a', function(e) {
        self.section.propagate = true;
        return true;
    });
    self.$element.on('click', function(e) {
        // if(!self.section.element_opened) {

        //     self.section.element_opened = true;

        // }
        self.open_editor();
        if(!self.section.propagate) {
            e.stopPropagation();
        }
        self.section.propagate = false;
    })

    if(self.options.styles) {
        for(var i in self.options.styles)  {
            self.load_data(self.options.styles[i], 'styles')
        }
    }
    if(self.options.values) {
        for(var i in self.options.values)  {
            self.load_data(self.options.values[i], 'values')
        }
    }

    self.$tabs.find('li').eq(-1).addClass('active')
    self.$contents.find('> div').eq(-1).addClass('active')
}
// Element.prototype.load_data = function(self) {
//     self = this;
//     self.section.open_editor();
//     self.$editor.show();
// };

Element.prototype.open_editor = function(self) {
    self = this;
    self.section.open_editor();
    if(self.container) {
        self.$container.show();

    }
    self.$editor.show();
};
Element.prototype.close_editor = function(self) {
    self = this;
    self.section.close_editor();
};




Element.prototype.load_tab = function(tab_name, self) {
    self = this;

    if(!self.current_tabs[tab_name]) {
        var title = self.editor.tabs[tab_name]
        if(!title) {
            title = self.editor.tabs['styles']
        }
        var rand = new Date().getTime();
        var $tab = $('<li class=""><a href="#section-element-'+rand+'-'+tab_name+'"><span class="fui-new"></span> '+title+'</a></li>')
        self.$tabs.append($tab)
        var $content = $('<div class="tab-pane" id="section-element-'+rand+'-'+tab_name+'"></div>');
        self.current_tabs[tab_name] = $content;
        self.$contents.append($content)
    }
    return self.current_tabs[tab_name];
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

Element.prototype.load_data = function(data, type, self, $field) {
    self = this;

    data = self.editor[type][data];
    if(data) {
        if(!data.label) {
            data.label = (data.name.charAt(0).toUpperCase() + data.name.slice(1)).replace('-', ' ')
        }
        $tab = self.load_tab( data.tab ? data.tab : type )

        if(data.get_value) {
            var real_value = $.trim(data.get_value({
                $elm: self.$element
            }));
        }
        else {
            if(type == 'styles') {
                var real_value = $.trim(self.$element.css(data.name));
            }
            else {
                var real_value = $.trim(self.$element.text());
            }
        }
        self.data.styles[data.name] = real_value;


        var input = self.editor.inputs[data.input];
        if(input) {
            $field = input.set_field({
                value: real_value,
                $elm: self.$element
            }, data, function(real_value) {
                if(data.set_value) {
                    var real_value = data.set_value({
                        value: real_value,
                        $elm: self.$element,
                        $field: $field
                    }, data);
                }
                else {
                    if(type == 'styles') {
                        self.$element.css(data.name, real_value);
                    }
                    else {
                        self.$element.text(real_value);
                    }
                }
                if(!self.data[type]) {
                    self.data[type] = {}
                }
                self.data[type][data.name] = real_value
                self.section.update_data()
            });
            $tab.append($field);
            if(input.init) {
                input.init({
                    value: real_value,
                    $elm: self.$element,
                    $field: $field
                }, data);
            }
        }
    }
}
