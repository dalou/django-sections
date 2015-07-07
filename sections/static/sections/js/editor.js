// var sections_plugins = []

var postJSON = function(url, data, success) {
    $.ajax({
        method: 'POST',
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        headers: {'content-type': 'application/json'},
        success: success
    });
}


Template.prototype.edit = function(self) {
    self = this;
    self.editor.$editor.empty();
    self.editor.$editor.html('\
        <div class="element-editor"><h3><span class="fui-new"></span>Template editor</h3>\
            <ul class="nav nav-tabs">\
                <li class="active">\
                    <a href="#editor-tab-1"><span class="fui-new"></span> Code</a>\
                </li>\
                <li class="">\
                    <a href="#editor-tab-2"><span class="fui-new"></span> Preview</a>\
                </li>\
                <li class="">\
                    <a href="#editor-tab-3"><span class="fui-new"></span> Screenshot</a>\
                </li>\
            </ul>\
            <div class="tab-content" id="#editor-tab-1"></div>\
            <div class="tab-content" id="#editor-tab-2"></div>\
            <div class="tab-content" id="#editor-tab-3"></div>\
        </div>');

    self.editor.open_editor('90%')

}


function Editor(version, self) {
    self = this;

    self.values = [];
    self.styles = [];
    self.tabs = [];
    self.inputs = [];
    self.pages = {}
    self.templates = [];
    self.version = version;

    self.current_page = null;

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


Editor.prototype.init = function(data, self) {
    self = this;

    self.$section_action = $('#section-actions')
    self.$main = $('#main');
    self.$sidebar = $('#sidebar');
    self.$editor = $('#editor')
    self.$templates = $('#templates');
    self.current_page = null;
    self.$page = $('#page');

    //self.$editor.accordion()

    // templates_init(this);
    // pages_init(this);


    /* PAGES */


    /************** EDITOR ***************/
    self.$editor.on('click', '>.close', function() {
        self.close_editor();
    })


    /************** TEMPLATES ***************/
    // self.$templates.on('click', 'a.close', function(e) {
    //     self.close_templates();
    // });
    // self.$templates.on('click', 'button.insert', function(e) {
    //     self.insert_template($(this).parent().parent());

    // });
    // self.$templates.on('click', 'button.thumbnail', function(e) {
    //     self.template_screenshot($(this).parent().parent())
    // });
    // self.$templates_menu = $('#editor-templates-menu')


    /************** PAGES ***************/

    $('#page-container button.page-delete').on('click', function() {
        self.current_page.remove();
    })


    // self.$pagesMenu.on('click', 'a.trigger', function(e) {

    //     $.fn.addLoadingFull();
    //     $('#pageTitle').text($(this).data('name'))
    //     self.close_editor();
    //     //self.current_page_pk = $(this).data('pk')
    //     self.$page.attr('src', $(this).data('url'))

    //     // e.stopPropagation();
    //     // return true;
    // });


    $(window).resize(function() {
        self.$page.height($(window).height()-53);
        self.$editor.height($(window).height()-93);
    });
    $(window).resize();
};
Editor.prototype.size_editor = function(width, self) {
    self = this;

    self.$editor.stop().animate({ left: 0, width: width }, function() {

    });
    self.$page.contents().find('body').animate({ zoom: 0.8  });
    self.$main.stop().animate({ marginLeft: width  });
}

Editor.prototype.open_editor = function($editor, width, self) {


    self = this;
    self.$editor.empty().append('\
        <a href="#" class="close">\
            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>\
        </a>\
    ').append($editor)

    if(!width) {
        width = 350
    }

    self.size_editor(width)
    // self.$editor.find('.accordion').accordion({
    //     header: "> div > h3",
    //     heightStyle: "content"
    // });
};
Editor.prototype.close_editor = function(self) {
    self = this;
    self.$editor.stop().animate({ left: -350, width: 350 }, function() {
        self.$editor.empty();
    });
    self.$page.contents().find('body').animate({ zoom: 1 });
    self.$main.stop().animate({ marginLeft: 0 });
};

Editor.prototype.postJSON = function(url, data, success, self) {
    self = this;
    $.ajax({
        method: 'POST',
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        headers: {'content-type': 'application/json'},
        success: success
    });
}



// Editor.prototype.insert_template = function($template, self) {
//     self = this
//     if(self.current_page) {
//         new Section(self.current_page, $template.data('pk') );
//     }
// };
// Editor.prototype.open_templates = function(self) {
//     self = this;
//     self.close_editor();
//     self.$templates.stop().animate({ width:400 });
//     self.$page.contents().find('body').animate({ zoom: 0.5 });
//     self.$page_container.stop().animate({ paddingLeft:410 });
// };
// Editor.prototype.close_templates = function(self) {
//     self = this;
//     self.$templates.stop().animate({ width:0 });
//     self.$page.contents().find('body').animate({ zoom: 1 });
//     self.$page_container.stop().animate({ paddingLeft:0 });
// };


$(document).ready(function(editor, DATA, IFRAME, TEMPLATES, SIDEBAR, PAGES, drop_trigger_count, SECTION_INIT, SECTIONS, SECTION_COUNT, TOSUBMIT) {

    // var min = 300;
    // var max = 3600;
    // var mainmin = 200;
    // $('#split-bar').mousedown(function (e) {
    //     e.preventDefault();
    //     $(document).mousemove(function (e) {
    //         e.preventDefault();
    //         var x = e.pageX - $('#sidebar').offset().left;
    //         if (x > min && x < max && e.pageX < ($(window).width() - mainmin)) {
    //           $('#sidebar').css("width", x);
    //           $('#main').css("margin-left", x);
    //         }
    //         e.stopPropagation();
    //     })
    // });
    // $(document).mouseup(function (e) {
    //     $(document).unbind('mousemove');
    // });


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

    $(document).on('click', ".nav-tabs a",  function (e) {
        e.preventDefault();
        $(this).parents('.nav-tabs').eq(0).find('li').removeClass('active');
        $(this).parent().addClass("active");

        var $target = $($(this).attr('href'))
        $target.parent().find('.tab-content').removeClass('active');
        $target.addClass("active");
    })



    $(document).on("click","[data-sidebar]", function(e){
        $('#editor').empty().addLoading()
        $.get($(this).data('sidebar'), null, function(data) {
            $('#editor').append(data);
            $('#editor').removeLoading()
        });


        $('#editor').stop().animate({ left: 0, width: 250 }, function() {

        });
        $('#page').contents().find('body').animate({ zoom: 0.8  });
        $('#main').stop().animate({ marginLeft: 250  });

    });





    $.fn.addLoadingFull();
    PageEditor.init();
    $.fn.removeLoadingFull();

});