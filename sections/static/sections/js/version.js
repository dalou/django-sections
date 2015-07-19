
function versions_init(editor) {

    $.get('/admin/sections/editor/versions/', null, function(data) {

        new Version({
            versions: data,
            editor: editor
        }, true);


    });
}

function version_create(editor, parent) {
    var message = 'Are you sur that you want to create new version';
    if(parent && parent.pk) {
        message += ' from '+parent.number
    }
    if(confirm(message + ' ?')) {
        postJSON('/admin/sections/editor/version/create/', {
            parent: parent ? parent.pk : null
        }, function(data) {
            // console.log(data)
            // data.parent = parent
            // data.editor = editor
            // new Version(data)
            document.location.reload()
        });
    }


}


function Version(data, root, self) {

    self = this;
    self.pk = data.pk;
    self.parent = data.parent;
    self.editor = data.editor;
    self.number = data.number;
    self.versions = [];
    self.is_active = data.is_active;
    self.is_current = data.is_current;
    self.root = root;


    if(self.root) {
        self.$menuItem = self.editor.$versionsMenu;

        self.$menuItem.on('click', '> ul > li.add a', function(e) {
            version_create(self.editor);
            e.stopPropagation();
        })
        self.$menuItem.on('click', '> ul > li.clone a', function(e) {
            version_create(self.editor, self.editor.current_version );
            e.stopPropagation();
        })
        self.$menuItem.on('click', '> ul > li.activate a', function(e) {
            self.editor.current_version.set_active(true);
            e.stopPropagation();
        })
    }
    else {
        self.$menuItem = $('\
        <li class="">\
            <a data-pk="'+data.pk+'" class="trigger">\
                v'+self.number+'\
            </a>\
            <ul class="dropdown-menu sub-menu">\
            </ul>\
        </li>');

        if(self.parent) {
            self.parent.$menuItem.find('>ul').append(self.$menuItem);
            //self.parent.$menuItem.find('>ul>li').eq(-1).after();
            self.parent.versions.push(self);
        }
        else {
            //self.editor.$versionsMenu.append(self.$menuItem);
            self.editor.append(self.$menuItem);
        }

        self.$menuItem.on('click', '> a', function(e) {
            self.set_current(true);
            e.stopPropagation();
        })
    }




    if(data.versions) {
        for(var i in data.versions) {
            var version = data.versions[i];
            version.editor = self.editor;
            version.parent = self;
            var version = new Version(version);
        }
    }
    if(self.is_active) {
        self.$menuItem.find('>a').text('v'+self.number+(self.is_active ? ' (active)' : ''))
        self.editor.active_version = self
    }
    if(self.is_current) {
        self.editor.current_version = self;
        self.editor.$versionsMenu.find('>a').html('v' + self.number+ '  <b class="caret"></b>');
        //$('#current_page_infos').empty().append(self.get_page_menu());
    }

    //self.editor.$pagesMenu.find('>ul>li').eq(-1).after(self.editor.$pagesMenu.find('>li.pages-add'));

}
Version.prototype.set_current = function(bool, self) {
    self = this;
    postJSON('/admin/sections/editor/version/current/', {
        pk: self.pk
    }, function(data) {
        document.location.reload()
    });
}

Version.prototype.set_active = function(bool, self) {
    self = this;
    if(confirm('Are you sur to activate this version '+this.number+' ?')) {
        postJSON('/admin/sections/editor/version/active/', {
            pk: self.pk
        }, function(data) {
            if(self.editor.active_version) {
                self.editor.active_version.is_active = false;
                self.editor.active_version.$menuItem.find('>a').text('v'+self.number+(self.is_active ? ' (active)' : ''))
            }
            self.is_active = true;
            self.$menuItem.find('>a').text('v'+self.number+(self.is_active ? ' (active)' : ''))
            self.editor.active_version = self
        });
    }
}