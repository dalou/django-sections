PageEditor.add_tab('styles', 'Styles');
PageEditor.add_tab('text', 'Texte');
PageEditor.add_tab('params', 'Settings');
PageEditor.add_tab('image', 'Image');
PageEditor.add_tab('html', 'Html');
PageEditor.add_tab('link', 'Link');
PageEditor.add_tab('content', 'Content');


PageEditor.add_input('image', {
    set_field: function(elm, opt, change, $input) {
        var $field = $('<div class="form-group clearfix"  id="">\
            <label for="" class="control-label">'+opt.label+':</label>\
        </div>');
        $input = $('<div class="dropzone"></div>');
        $input.css('background-image', 'url('+elm.value.replace(/^url\(/, '').replace(/\)$/, '')+')');
        $input.css('background-size', 'contain');
        $input.dropzone({

            url: '/admin/sections/editor/upload/image/'
            , addRemoveLinks : true
            , dictRemoveFile: ''
            , dictCancelUpload: ''
            //, clickable : "#"+$form.find('a.drop').attr("id")
            , dictDefaultMessage: ''
            //, maxFiles: 1
            , paramName: 'image'
            , sending: function(file, xhr, formData) {
                $input.addLoading('Sending');
                formData.append("file_typemime", file.type)
            }
            , removedfile: function(file) {}
            , uploadprogress: function(file, progress) {
                $input.addLoading('Uploading ('+Math.round(progress)+'%)');
            }
            , complete: function(file, data) {}
            , success: function(file, data) {
                $input.empty()
                $input.css('background-image', 'url('+data.image+')');
                $input.val(data.image);
                change(data.image);
                return true;
            }
        });
        $field.append($input);
        return $field;
    }
});

PageEditor.add_input('tinymce', {
    set_field: function(elm, opt, change, $field) {
        var id = (new Date().getTime() + Math.random()).toString().replace('.','_');
        $field = $('<div >\
            <textarea id="'+id+'"></textarea>\
            <a class="apply btn btn-primary btn-lg btn-block" href="#">Apply</a>\
        </div>');
        $field.find('textarea').val(elm.value);
        $field.on('click', 'a.apply', function() {
            change($field[0].tinymce.getContent());
        })


        return $field;
    },
    init: function(elm, opt, change) {
        var tmce = tinymce.init({
            selector: '#'+elm.$field.find('textarea').attr('id'),
            plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen textcolor",
                "insertdatetime media table contextmenu paste"
            ],
            init_instance_callback : function(editor) {
                elm.$field[0].tinymce = editor
            },
            menubar: false,
            toolbar_items_size: 'small',
            toolbar: "insertfile undo redo | styleselect | bold italic | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code"
        });
    }
});

PageEditor.add_input('text', {
    set_field: function(elm, opt, change) {
        var $field = $('<div class="form-group clearfix"  id="">\
            <label for="" class="control-label">'+opt.label+':</label>\
        </div>');
        var $input = $('<input type="text" class="form-control input-sm" \
            placeholder="'+opt.label+'" \
            value="'+elm.value+'">');
        $input.on('change', function() {
            change($(this).val());
        })
        $field.append($input);
        return $field;
    }
});

PageEditor.add_input('color', {
    set_field: function(elm, opt, change) {


        var $field = $('<div class="form-inline">\
          <div class="form-group">\
            <div class="input-group">\
              <div class="input-group-addon">'+opt.label+':</div>\
              <input type="text" class="form-control" placeholder="'+opt.label+'" value="'+elm.value+'">\
              <div class="input-group-addon"></div>\
            </div>\
          </div>\
        </div>')
        $field.find('input').colpick({
            layout:'hex',
            submit:0,
            colorScheme:'dark',
            onChange:function(hsb,hex,rgb,el,bySetColor) {
                $(el).next().css('background','#'+hex);
                elm.$elm.css(opt.name, '#'+hex)
                // Fill the text box just if the color was set using the picker, and not the colpickSetColor function.
                if(!bySetColor) $(el).val('#'+hex);
                change('#'+hex);
            }
        }).keyup(function(){
            $(this).colpickSetColor(this.value);
        }).next().css({
            background: elm.value, width:  42
        })
        return $field;
    }
});

PageEditor.add_input('choice', {
    set_field: function(elm, opt, change) {
        var $input = $('<select class="form-control clearfix">\
                        </select>');
        for(var i in opt.choices) {
            var choice = opt.choices[i];
            $input.append('<option value="'+i+'">'+choice+'</option>')
        }
        $input.on('change', function() {
            change($(this).val());
        })
        return $input;
    },
});

PageEditor.add_input('pixel', {
    set_field: function(elm, opt, change) {

        var $field = $('<div class="form-inline">\
          <div class="form-group">\
            <div class="input-group">\
              <div class="input-group-addon">'+opt.label+':</div>\
              <input type="text" class="form-control" placeholder="'+opt.label+'" value="'+parseInt(elm.value)+'">\
              <div class="input-group-addon">px</div>\
            </div>\
          </div>\
        </div>')
        $field.on('change', 'input', function() {
            change(parseInt($(this).val()) + 'px');
        })
        return $field;
    },
})









choices = {};
choices_values = [5,7,8,9,10,11,12,13,14,15,16,17,18,19,20,25,30,35,40,50,60];
for(var i in choices_values) {
    choices[choices_values[i]+'px'] = choices_values[i]+'px';
}
PageEditor.add_style('font-size', { input: 'pixel' })
PageEditor.add_style('font-weight', { input: 'choice', choices: {
    'inherit': 'Normal',
    'cover': 'Cover',
    'contain': 'Contain',
}})
PageEditor.add_style('color', {  input: 'color', label: 'Font color' })
PageEditor.add_style('background-color', {  input: 'color' })
PageEditor.add_style('background-size', { input: 'choice', label: 'Background type', choices: {
    'inherit': 'Normal',
    'cover': 'Cover',
    'contain': 'Contain',
}})
PageEditor.add_style('background-image', {
    input: 'image', label: 'Background image',
    set_value: function(elm, opt) {
        elm.$elm.css('background-image', 'url('+elm.value+')')
        return 'url('+elm.value+')';
    }}
)

PageEditor.add_style('padding-top', { input: 'pixel' })
PageEditor.add_style('padding-bottom', { input: 'pixel' })
PageEditor.add_style('padding-left', { input: 'pixel' })
PageEditor.add_style('padding-right', { input: 'pixel'})

PageEditor.add_style('margin-top', { input: 'pixel' })
PageEditor.add_style('margin-bottom', { input: 'pixel' })
PageEditor.add_style('margin-left', { input: 'pixel' })
PageEditor.add_style('margin-right', { input: 'pixel'})













PageEditor.add_value('youtube', {
    input: 'text', label: 'Youtube', tab: 'content',
    get_value: function(elm, opt) {
        return elm.$elm.find('iframe').attr('src');
    },
    set_value: function(elm, opt) {
        elm.$elm.find('iframe').attr('src', elm.value);
        return elm.value;
    }
})


PageEditor.add_value('href', {
    input: 'text', label: 'Link', tab: 'link',
    get_value: function(elm, opt) {
        return elm.$elm.attr('href');
    },
    set_value: function(elm, opt) {
        elm.$elm.attr('href', elm.value);
        return elm.value;
    }
})
PageEditor.add_value('image', {
    input: 'image', tab: 'image',
    get_value: function(elm, opt) {
        if(elm.$elm.is('img')) {
            return elm.$elm.attr('src');
        }
        else {
            return elm.$elm.find('img').eq(0).attr('src');
        }
    },
    set_value: function(elm, opt) {
        if(elm.$elm.is('img')) {
            elm.$elm.attr('src', elm.value);
        }
        else {
            elm.$elm.find('img').eq(0).attr('src', elm.value);
        }
        return elm.value;
    }
})

PageEditor.add_value('text', {
    input: 'text', tab: 'text',
    set_value: function(elm, opt) {
        elm.$elm.text(elm.value);
        return elm.value;
    }
})
PageEditor.add_value('html', {
    input: 'tinymce', label: 'Html', tab: 'html',
    get_value: function(elm, opt) {
        return elm.$elm.html();
    },
    set_value: function(elm, opt) {
        elm.$elm.html(elm.value)
        return elm.value;
    }
})
// PageEditor.add_value('boolean', {
//     input: 'boolean', label: 'Boolean', tab: 'params',
//     apply: function(e) {
//         e.element.text(e.input.val())
//         return e.input.val();
//     }
// })