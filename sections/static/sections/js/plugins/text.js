sections_plugins['text'] = function($iframe, $field, options) {
    $iframe[0].data[options.name] = $field.html();
    $field.dblclick(function($modal, id) {
        id = (new Date().getTime() + Math.random()).toString().replace('.','_');
        $modal = $('<div class="app app-modal">\
            <div class="modal-head">Saissisez le contenu</div>\
            <div class="modal-content-old"><textarea></textarea></div>\
            <div class="modal-foot"><a class="btn btn-info pull-right">Valider</a></div>\
        </div>');
        $modal.find('textarea')
            //.hide()
            .attr('id', id)
            .val($iframe[0].data[$field.data('form').name]);
        $modal.find('a').click(function() {
            var html = tinymce.activeEditor.getContent({format : 'raw'});
            $iframe[0].data[$field.data('form').name] = html
            $field.html(html);
            console.log(content)
            $modal.modal('close');
        })

        $modal.modal('show');
        tinymce.init({
            selector: '#'+id,

            plugins: [
                "advlist lists charmap print preview ",
                "searchreplace visualblocks",
                "insertdatetime contextmenu paste"
            ],
            toolbar: "insertfile undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent "

        });
        return false;


    })
}