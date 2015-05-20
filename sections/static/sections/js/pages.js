
function Page(editor, $page, self) {
    self = this

    self.editor = editor;
    self.editor.current_page = self;
    self.$page_iframe = $page;
    console.log(self.$page_iframe.contents().document)
    self.url = self.$page_iframe.contents().document.location.href
    self.$page_menu = self.editor.$pages_menu.find('[data-url="'+self.url+'"]')
    self.pk = self.$page_menu.data('pk');
    self.$page = self.$page_iframe.contents();
    self.sections = [];

    $('#pageTitle').text(self.$page_menu.data('name') + ' (id: '+self.pk+')')

    self.$page.find('[data-section]').each(function() {

        self.sections.push(new Section(self, $(this)));

    });
    self.$page.click(function() {
        $('nav .dropdown').removeClass('open');
    });

};
Page.prototype.reload = function(callback, self) {
    self = this;
    self.editor.close_editor();
    self.editor.$editor.empty();
    if(callback) {
        self.editor.page_load_callback = callback
    }
    self.$page_iframe.attr('src', self.url + '?rand='+ (new Date().getTime()))

}
Page.prototype.reorder_sections = function(orders, self) {
    self = this;
    orders = []
    //self.$page.addLoading();
    self.$page.find('[data-section]').each(function(i) {
        orders.push({
            pk: $(this).data('section'),
            order: i
        });
        $(this)[0].section.order = i;
        $(this)[0].section.$editor.find('h3 span').eq(1).text(i);
    });
    console.log(orders)
    $.ajax({
        method: 'POST',
        url: '/admin/sections/editor/sections/reorder/',
        data: JSON.stringify(orders),
        contentType: 'application/json; charset=utf-8',
        headers: {'content-type': 'application/json'},
        success: function(data) {
            //self.$page.removeLoading();
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
                self.editor.$pages_menu.find('a[data-pk='+self.pk+']').parent().remove();
                self.editor.$pages_menu.find('a[data-pk]').eq(0).click();
            }
        }
    });
}


