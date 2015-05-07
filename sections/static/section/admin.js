$(document).ready(function(drop_trigger_count, SECTION_INIT, SECTIONS, SECTION_COUNT, TOSUBMIT) {


    SECTION_COUNT = 0;
    SECTIONS = [];
    TOSUBMIT = null;
    $('#page_form').after($('#section-forms'))





    $('#page_form').submit(function(event, $form, $iframe, error) {

        $('#page_form').addLoading();
        $('#sections .section').each(function(i, $section) {
            var $iframe = $(this).find('iframe')
            $.ajax({
                url: $('#sections').data('update'),//.update_url,
                type: 'POST',
                dataType: 'json',
                data: [
                    { name: 'section_title', value: $iframe.data('section-title') },
                    { name: 'section_order', value: i },
                    { name: 'section_data', value: JSON.stringify($iframe[0].data) },
                    { name: 'section_type', value: $iframe.data('section-type') },
                    { name: 'section_pk', value: $iframe.data('section-pk') }
                ],
                async: false,
                success: function (data) {
                    console.log('SUCCESS');
                    //console.log(data);
                    //$form.replaceWith($(data))
                    //SECTION_INIT($form)
                    //$('#page_form').submit();
                },
                error: function(data) {
                    console.log('ERROR');
                    error = true;
                    //$form.replaceWith($(data))

                }
            });
        });
        if(error) {
            return false;
        }
        $('#page_form').removeLoading();

    });


    SECTION_INIT = function($iframe, $content, $fields) {

        if(!$content[0].section_initialized) {
            $content[0].section_initialized = true;
            $iframe.css({
                width: '100%',
                border:0,
            })
            $iframe[0].data = {}

            $(window).resize(function() {
                $iframe.height($content.height());
            });
            $(window).resize();

            $tooltip = $('<div></div>')

            $remove = $('<a class="pull-right btn btn-danger">Supprimer</a>').click(function() {
                if(confirm('Supprimer cette section ?')) {
                    if($iframe.data('remove')) {

                        $.post($iframe.data('remove'), null, function() {
                            $iframe.parent().remove();
                        });
                    }
                    else {
                        $iframe.parent().remove();
                    }
                }
            });
            $up = $('<a class="pull-left btn btn-primary">Monter</a>').click(function() {
                $iframe.parent().prev().before($iframe.parent());
                $.smoothScroll({
                    scrollTarget:  $iframe.prev()
                })
            });
            $down = $('<a class="pull-left btn btn-primary">Descendre</a>').click(function() {
                $iframe.parent().next().after($iframe.parent());
                $.smoothScroll({
                    scrollTarget:  $iframe.prev()
                })

            });
            $tooltip.append($up)
            $tooltip.append($down)
            $tooltip.append($remove)
            $iframe.prev().tooltipster({
                content: $tooltip,
                interactive: true,
                position: 'top'
            })


            $fields = $content.find('[data-form]').each(function($field, options) {
                $field = $(this).css({
                    cursor:'pointer'
                });
                //$field.attr('id', id)
                options = $(this).data('form')

                // CHAR
                if(options.type == "char") {
                    $iframe[0].data[options.name] = $.trim($field.text());
                    $field.dblclick(function() {
                        text = prompt('Saississez un texte', $iframe[0].data[options.name]);
                        if(text != null) {
                            $iframe[0].data[$field.data('form').name] = text;
                            $field.text(text);
                        }
                        return false;
                    })
                }

                // TEXT
                else if(options.type == "text") {
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
                                "advlist autolink lists link image charmap print preview anchor",
                                "searchreplace visualblocks code fullscreen textcolor",
                                "insertdatetime media table contextmenu paste"
                            ],
                            toolbar: "insertfile undo redo | styleselect | bold italic | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"

                        });
                        return false;


                    })
                }
                else if(options.type == "image_background" || options.type == "image") {
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
                                if(options.type == "image") {
                                    $field.find('img').attr('src', data.image);
                                }
                                else {
                                    $field.css({
                                        backgroundImage: 'url('+data.image+')'
                                    });
                                }
                                return true;
                            }

                        });
                        return false;
                    });
                }
                            console.log($iframe[0].data)
                if(options.movable) {
                    $field.draggable($.extend(options.movable, {
                        containment: $field.parents('section'),
                        stop: function(e, item) {

                            $iframe[0].data[options.name+'__x'] = item.offset.left
                            $iframe[0].data[options.name+'__y'] = item.offset.top
                            console.log($iframe[0].data)
                        }
                    }))
                }
                // $field.tooltipster({
                //     content: $('<h2>Cliquer pour changer</h2>'),
                //     trigger: 'custom',
                //     autoClose: false
                // });
                $field.append($('<div class="__edit_tooltip__ tooltipspter-default tooltipspter-noir">Double-clic pour editer</div>').css({
                    position: 'absolute',
                    left: $field.position().left +5, top:$field.position().top+5,
                    fontSize: 12, fontWeight: "bold", color:'black', padding: 5, textTransform: 'uppercase', lineHeight: "12px",
                    background: 'white', boxShadow: 'inset 0px 0px 10px blue', borderRadius: 5
                }).hide())
                $field.mouseover(function(e) {
                    $field.css({
                        boxShadow: 'inset 0px 0px 10px blue',
                        //margin: -3
                    }).find('>.__edit_tooltip__').show()
                    e.stopPropagation();
                    return false;
                }).mouseout(function(e) {
                    $field.css({
                        boxShadow: '',

                    }).find('>.__edit_tooltip__').hide()//.tooltipster('show')
                    e.stopPropagation();
                    return false;
                });
            })
        }
    }

    $('#sections .section').each(function($iframe, $content) {
        $iframe = $(this).find('iframe')
        $(this).addLoading()
        $iframe.on('load', function() {
            SECTION_INIT($iframe, $iframe.contents())
            $iframe.parent().removeLoading();
        });
        $iframe.attr('src', $iframe.data('src'));
    });


    $("#sections-add-modal .add-section").click(function($section, $iframe) {

        $section = $('<div class="section"><h3>Section '+($('#sections .section').length+1)+'</h3></div>');

        $iframe = $('<iframe data-section-type="'+$(this).data('section-type')+'" ></iframe>');
        $iframe.css({
            width: '100%',
            border:0,
        })
        $section.append($iframe);
        $('#sections').append($section);
        $section.addLoading();
        $iframe.on('load', function() {
            SECTION_INIT($iframe, $iframe.contents())
            $iframe.parent().removeLoading();

        });
        $iframe.attr('src', $(this).data('src'));
        $('#sections-add-modal').modal('close');

        // $('#sections').accordion('destroy').accordion({
        //     collapsible: true,
        //     heightStyle: "auto",
        //     active: null,
        //     header: "> div > h3"
        // });
        return false;
    });

    // $addSection = $('<li class="pull-right"><button>+ Nouvelle Section</button></li>').click(function() {
    //     $('#sections-add-modal').modal();
    //     return false;

    // });
    //$('#suit_form_tabs').append($addSection)


    $('#section-add, #section-add-top').click(function() {
        $('#sections-add-modal').modal();
        return false;
    })

    $('#sections')/*.accordion({
        collapsible: true,
        heightStyle: "content",
        active: null,
        header: "> div > h3"
    }).sortable({
        axis: "y",
        handle: "h3",
        stop: function( event, ui ) {
          // IE doesn't register the blur when sorting
          // so trigger focusout handlers to remove .ui-state-focus
          ui.item.children( "h3" ).triggerHandler( "focusout" );

          // Refresh accordion to handle new order
          $( this ).accordion( "refresh" );
        }
      });*/


});