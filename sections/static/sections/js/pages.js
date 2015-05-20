
function Page(editor, $page, self) {
    self = this

    self.$page = $page;
    self.pk = $page.data('page');
    self.editor = editor;
    self.sections = [];

    self.$page.find('[data-section]').each(function() {

        self.sections.push(new Section(self, $(this)));

    });
    self.$page.click(function() {
        $('nav .dropdown').removeClass('open');
    });
};
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


