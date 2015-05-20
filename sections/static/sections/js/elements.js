
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
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
    self = this;
    self.section = section
    self.editor = section.editor;
    self.data = {
        styles: {}, values: {}
    }

    self.load($element)

}

Element.prototype.load = function($element, self) {
    self = this;
    self.options = $element.data('element')
    self.current_tabs = {}
    self.$element = $element;
    self.$element[0].sections_element = self;
    self.elements = [];
    self.parent = null;

    self.key = self.options.name;
    var keys = self.key.split('.');
    self.name = keys.pop();
    self.parent_key = keys.join('.');

    if(self.parent_key) {


        self.$container = $('<div class="element-editor"><h3><span class="fui-new"></span> Container</h3>\
            <div class="editor-element-container-actions">\
                <button type="button" class="prev btn btn-inverse"><span class="fui-arrow-left"></span></button>\
                <button type="button" class="next btn btn-inverse"><span class="fui-arrow-right"></span></button>\
                <button type="button" class="add btn btn-primary"><span class="fui-plus"></span></button>\
                <button type="button" class="delete btn btn-danger"><span class="fui-trash"></span></button>\
            </div><hr />\
        </div>').hide();

        self.$container.on('click', '.editor-element-container-actions button.prev', function(e) {
            moveUp(self.elements, self)
            self.section.update()
        });
        self.$container.on('click', '.editor-element-container-actions button.next', function(e) {
            moveDown(self.elements, self)
            self.section.update()
        });
        self.$container.on('click', '.editor-element-container-actions button.delete', function(e) {
            if(confirm('Delete this contained element ?')) {
                self.remove();
            }
        });
        self.$container.on('click', '.editor-element-container-actions button.add', function(e) {

            self.parent.add_element()
        });

        self.section.$editor.append(self.$container);

        self.parent = self.section.elements[self.parent_key];
        self.parent.elements.push(self);
    }
    else {
        self.section.elements[self.key] = self
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
        e.preventDefault();
    })

    if(self.options.styles) {
        var styles = self.options.styles.split(',')
        for(var i in styles )  {
            self.load_data(styles[i], 'styles')
        }
    }
    if(self.options.values) {
        var values = self.options.values.split(',')
        for(var i in values)  {
            self.load_data(values[i], 'values')
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
    if(self.$container) {
        self.$container.show();

    }
    self.$editor.show();
};
Element.prototype.close_editor = function(self) {
    self = this;
    self.section.close_editor();
};


Element.prototype.add_element = function(self) {
    self = this;
    data = self.to_data(true);
    for(var i in data.container) {
        if(i == 0) {
            for(var rname in data.container[i]) {
                var toremove = data.container[i][rname];

                var $clone = toremove.$element.clone();
                self.elements.push(new Element(self.section, $clone))
            }
        }
    }
    self.section.update(function(page) {
        console.log('RELOAD AFTER ELEMENT ADD', page)
    })
}

Element.prototype.remove = function(self) {
    self = this;
    if(self.parent) {
        data = self.parent.to_data(true);
        for(var i in data.container) {
            for(var name in data.container[i]) {
                if(data.container[i][name] == self) {
                    for(var rname in data.container[i]) {
                        var toremove = data.container[i][rname];
                        var index = self.parent.elements.indexOf(toremove);
                        self.parent.elements.splice(index, 1);
                    }
                }
            }
        }
    }
    else {
        delete self.section.elements[self.key];
    }
    self.section.update(function(page) {
        console.log('RELOAD AFTER ELEMENT DEL', page)
    })
}

Element.prototype.to_data = function(with_element, self) {
    self = this;
    var data = self.data;
    if(self.elements.length) {
        data.container = [];

        var by_names = {}
        for(var i in self.elements) {
            var element = self.elements[i]

            if(! by_names[element.name] ) {
                by_names[element.name] = []
            }
            by_names[element.name].push(element)

        }
        for(var i in by_names) {
            for(var j in by_names[i]) {
                if(!data.container[j]) {
                   data.container[j] = {}
                }
                data.container[j][i] = with_element ? by_names[i][j] : by_names[i][j].to_data()
            }
        }
    }
    return data;

}


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
        self.data[type][data.name] = real_value;


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
                self.section.update()
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
