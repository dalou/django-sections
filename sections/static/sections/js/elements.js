
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

function Element(data, self) {
    self = this;
    self.section = data.section;
    self.editor = self.section.editor;
    self.$element = data.$element;
    self.data = {
        styles: {}, values: {}
    }
    self.elements = [];
    self.options = self.$element.data('element')
    self.key = self.options.name;
    var keys = self.key.split('.');
    self.name = keys.pop();
    self.parent_key = keys.join('.');
    self.current_tabs = {}
    self.$element[0].sections_element = self;
    self.parent = null;


    self.$element.on('mouseenter', function(e) {
        self.highlight();
        e.stopPropagation();
        return false;
    });
    self.$element.on('mouseleave', function(e) {
        self.unhighlight();
        e.stopPropagation();
        return false;
    });
    self.$element.on('click', function(e) {
        console.log('ELEMENT CLICK')
        self.editor.open_editor(self.get_editor());

        if(!self.section.propagate) {
            e.stopPropagation();
        }
        self.section.propagate = false;
        e.preventDefault();
        e.stopPropagation();
    });


    if(self.parent_key) {
        self.parent = self.section.elements[self.parent_key];
        self.parent.elements.push(self);
    }
    else {
        self.section.elements[self.key] = self
    }


    // self.$editor = $('<div class="element-editor"><h3><span class="fui-new"></span> Element</h3>\
    //             <ul class="nav nav-tabs"></ul>\
    //             <div class="tab-content" ></div></div>').hide();
    // self.$tabs = self.$editor.find('ul.nav-tabs');
    // self.$contents = self.$editor.find('div.tab-content');
    // self.section.$editor.append(self.$editor);
    // self.$element.on('click', 'a', function(e) {
    //     self.section.propagate = true;
    //     return true;
    // });
    // self.$element.on('click', function(e) {
    //     // if(!self.section.element_opened) {

    //     //     self.section.element_opened = true;

    //     // }
    //     self.open_editor();
    //     if(!self.section.propagate) {
    //         e.stopPropagation();
    //     }
    //     self.section.propagate = false;
    //     e.preventDefault();
    // })

    // if(self.options.styles) {
    //     var styles = self.options.styles.split(',')
    //     for(var i in styles )  {
    //         self.load_data(styles[i], 'styles')
    //     }
    // }
    // if(self.options.values) {
    //     var values = self.options.values.split(',')
    //     for(var i in values)  {
    //         self.load_data(values[i], 'values')
    //     }
    // }

    // self.$tabs.find('li').eq(-1).addClass('active')
    // self.$contents.find('> div').eq(-1).addClass('active')
}
Element.prototype.highlight = function(kwargs, self) {
    self = this;
    self.$element.css({
        outline: 'red dashed 3px',
        cursor: 'pointer'
    })
}
Element.prototype.unhighlight = function(kwargs, self) {
    self = this;
    self.$element.css({
        outline: '',
        cursor: ''
    })
}



Element.prototype.set_field = function(name, type, $tabs, $contents, current_tabs, data, self, $field, input, value) {
    self = this;
    data = self.editor[type][name];
    if(data) {
        value = self.get_value(name, type);
        input = self.editor.inputs[data.input];

        if(!data.label) {
            data.label = (data.name.charAt(0).toUpperCase() + data.name.slice(1)).replace('-', ' ')
        }
        var tab_name = data.tab ? data.tab : type
        if(!current_tabs[tab_name]) {
            var title = self.editor.tabs[tab_name];
            if(!title) {
                title = self.editor.tabs['styles'];
            }
            var rand = new Date().getTime();
            var $tab = $('<li class=""><a href="#section-element-'+rand+'-'+tab_name+'"><span class="fui-new"></span> '+title+'</a></li>')
            $tabs.append($tab)
            var $content = $('<div class="tab-pane" id="section-element-'+rand+'-'+tab_name+'"></div>');
            current_tabs[tab_name] = $content;
            $contents.append($content);
        }
        var $tab = current_tabs[tab_name];

        if(input) {
            $field = input.set_field({
                value: value,
                $elm: self.$element
            }, data, function(returned_value) {
                if(data.set_value) {
                    data.set_value({
                        value: returned_value,
                        $elm: self.$element,
                        $field: $field
                    }, data);
                }
                else {
                    if(type == 'styles') {
                        self.$element.css(name, returned_value);
                    }
                    else {
                        self.$element.text(returned_value);
                    }
                }
                self.section.update();
            });
            $tab.append($field);
            if(input.init) {
                console.log('INIT', input, $field)
                setTimeout(function() {


                    input.init({
                        value: value,
                        $elm: self.$element,
                        $field: $field
                    }, data);
                }, 100)
            }
            return $field;
        }
    }
    return null;
}


// Element.prototype.load_data = function(self) {
//     self = this;
//     self.section.open_editor();
//     self.$editor.show();
// };



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

Element.prototype.get_value = function(name, type, self) {
    self = this;
    data = self.editor[type][name];
    if(data) {
        if(data.get_value) {
            return $.trim(data.get_value({
                $elm: self.$element
            }));
        }
        else {
            if(type == 'styles') {
                return $.trim(self.$element.css(name));
            }
            else {
                return $.trim(self.$element.text());
            }
        }
    }
    return null;
}

Element.prototype.to_data = function(with_element, self) {
    self = this;

    var data = {
        styles: {}, values: {}
    }
    var types = ['styles', 'values']
    for(var i in types) {
        var type = types[i];
        if(self.options[type]) {
            var names = self.options[type].split(',')
            for(var i in names)  {
                var value = self.get_value($.trim(names[i]), type);
                if(value && $.trim(value != "")) {
                    data[type][names[i]] = value;
                }
            }
        }
    }

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


Element.prototype.target = function(self) {
    self = this;
    self.$element.parents('html,body').animate({scrollTop: self.$element.offset().top + self.editor.$page.scrollTop() + self.editor.$page.height/2 },'slow');
}

Element.prototype.get_editor = function(kwargs, self) {
    self = this;



    var current_tabs = {}




    var $editor = $('\
        <div class="editor-element">\
            <h3 class="pull-left"><span class="fui-new"></span> Element :</h3>\
            <div class="editor-section-actions pull-right">\
                <button type="button" class="target btn btn-xs btn-primary"><span class="fui-eye"></span></button>\
            </div>\
            <div class="clearfix"></div>\
            <div>\
                <ul class="nav nav-tabs"></ul>\
                <div class="tab-content"></div>\
            </div>\
        </div>')
        .on('click', '.editor-section-actions button.target', function() { self.target({ $editor: $editor }); })

    var $tabs = $editor.find('ul.nav-tabs');
    var $contents = $editor.find('div.tab-content');




    $editor.on('mouseenter', function(e) {
        self.highlight();
    });
    $editor.on('mouseleave', function(e) {
        self.unhighlight();
    });



    if(self.parent) {
        var $container = $('<div class="container-editor"><h3><span class="fui-new"></span> Container</h3>\
            <div class="editor-element-container-actions">\
                <button type="button" class="prev btn btn-inverse"><span class="fui-arrow-left"></span></button>\
                <button type="button" class="next btn btn-inverse"><span class="fui-arrow-right"></span></button>\
                <button type="button" class="add btn btn-primary"><span class="fui-plus"></span></button>\
                <button type="button" class="delete btn btn-danger"><span class="fui-trash"></span></button>\
            </div><hr />\
        </div>');

        $container.on('click', '.editor-element-container-actions button.prev', function(e) {
            moveUp(self.elements, self)
            self.section.update()
        });
        $container.on('click', '.editor-element-container-actions button.next', function(e) {
            moveDown(self.elements, self)
            self.section.update()
        });
        $container.on('click', '.editor-element-container-actions button.delete', function(e) {
            if(confirm('Delete this contained element ?')) {
                self.remove();
            }
        });
        $container.on('click', '.editor-element-container-actions button.add', function(e) {

            self.parent.add_element()
        });

        $editor.prepend($container)
    }



    $editor.prepend(self.section.get_editor())

    types = ['styles', 'values']
    for(var i in types) {
        var type = types[i];
        console.log(self.options, type)
        if(self.options[type]) {
            var names = self.options[type].split(',')
            //console.log(names)
            for(var i in names)  {
                //console.log(type, names[i], self.get_value(names[i], type))
                self.set_field($.trim(names[i]), type, $tabs, $contents, current_tabs);
            }
        }
    }
    $tabs.find('li').eq(-1).addClass('active')
    $contents.find('> div').eq(-1).addClass('active');
    return $editor;
}






// Element.prototype.load_tab = function(tab_name, self) {
//     self = this;

//     if(!self.current_tabs[tab_name]) {
//         var title = self.editor.tabs[tab_name]
//         if(!title) {
//             title = self.editor.tabs['styles']
//         }
//         var rand = new Date().getTime();
//         var $tab = $('<li class=""><a href="#section-element-'+rand+'-'+tab_name+'"><span class="fui-new"></span> '+title+'</a></li>')
//         self.$tabs.append($tab)
//         var $content = $('<div class="tab-pane" id="section-element-'+rand+'-'+tab_name+'"></div>');
//         self.current_tabs[tab_name] = $content;
//         self.$contents.append($content)
//     }
//     return self.current_tabs[tab_name];
// }


// Element.prototype.load_data = function(data, type, self, $field, input, real_value) {
//     self = this;

//     data = self.editor[type][data];
//     if(data) {
//         if(!data.label) {
//             data.label = (data.name.charAt(0).toUpperCase() + data.name.slice(1)).replace('-', ' ')
//         }
//         $tab = self.load_tab( data.tab ? data.tab : type )

//         if(data.get_value) {
//             real_value = $.trim(data.get_value({
//                 $elm: self.$element
//             }));
//         }
//         else {
//             if(type == 'styles') {
//                 var real_value = $.trim(self.$element.css(data.name));
//             }
//             else {
//                 var real_value = $.trim(self.$element.text());
//             }
//         }
//         self.data[type][data.name] = real_value;


//         input = self.editor.inputs[data.input];
//         if(input) {
//             $field = input.set_field({
//                 value: real_value,
//                 $elm: self.$element
//             }, data, function(real_value) {
//                 if(data.set_value) {
//                     var real_value = data.set_value({
//                         value: real_value,
//                         $elm: self.$element,
//                         $field: $field
//                     }, data);
//                 }
//                 else {
//                     if(type == 'styles') {
//                         self.$element.css(data.name, real_value);
//                     }
//                     else {
//                         self.$element.text(real_value);
//                     }
//                 }
//                 if(!self.data[type]) {
//                     self.data[type] = {}
//                 }
//                 self.data[type][data.name] = real_value
//                 self.section.update()
//             });
//             $tab.append($field);
//             if(input.init) {
//                 setTimeout(function() {

//                     input.init({
//                         value: real_value,
//                         $elm: self.$element,
//                         $field: $field
//                     }, data);
//                 }, 4200)
//             }
//         }
//     }
// }