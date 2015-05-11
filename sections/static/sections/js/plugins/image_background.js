sections_plugins['image_background'] = function($iframe, $field, options) {
    $iframe[0].data[options.name] = options.image;
    $field.dblclick(function($modal, id) {
        id = (new Date().getTime() + Math.random()).toString().replace('.','_');
        $modal = $('<div class="app app-modal">\
            <div class="modal-head">Saissisez l\'image</div>\
            <div class="modal-content-old">\
                <div class="dropzone">\
                    <div class="dz-message">\
                        Drop files here or click to upload.<br>\
                    </div>\
                </div>\
            </div>\
            <div class="modal-foot"><a class="btn btn-danger pull-right">Supprimer</a></div>\
        </div>');
        $modal.modal('show');
        $modal.find('a.btn-danger').click(function() {

            $modal.modal('close');
            $iframe[0].data[options.name] = null;
            $field.css({
                backgroundImage: ''
            })
        })

        $modal.find('.dropzone').dropzone({

            url: options.upload_url
            , addRemoveLinks : true
            , dictRemoveFile: ''
            , dictCancelUpload: ''
            //, clickable : "#"+$form.find('a.drop').attr("id")
            , dictDefaultMessage: ''
            //, maxFiles: 1
            , paramName: 'image'
            , sending: function(file, xhr, formData) {
                $modal.addLoading('Sending PDF');
                // for(var i in data) {
                //     if(data[i])
                //     {
                //         formData.append(i, data[i])
                //     }
                // }
                formData.append("file_typemime", file.type)
            }
            , removedfile: function(file) {}
            , uploadprogress: function(file, progress) {
                $modal.addLoading('Uploading PDF ('+Math.round(progress)+'%)');
            }
            , complete: function(file, data) {
            }
            , success: function(file, data) {
                $modal.modal('close');
                $iframe[0].data[options.name] = data.image
                $field.css({
                    backgroundImage: 'url('+data.image+')'
                });
                return true;
            }

        });
        return false;
    });
}