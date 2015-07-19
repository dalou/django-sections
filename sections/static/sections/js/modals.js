


$(document).ready(function(click) {

    var MODAL_CURRENT = null;



    click = function(event, trigger, target) {
        //event.preventDefault();
        trigger = $(this);
        target = trigger.data('modal');
        if(target[0] == '#') {
            $(target).eq(0).sectionsModal();
        }
        else {
            var loading = $('<div></div>').appendTo('body').addLoading().sectionsModal()
            $.get(target, null, function(data) {
                //MODAL_BLOCKER.removeLoading();
                //$(data).eq(0).modal();
                data = $(data).hide().addClass('in')
                loading.replaceWith(data.fadeIn())

                //MODAL_BLOCKER.removeClass('in').fadeIn();

            });
        }
    }

    //$('[data-modal]').click(click);
    $(document).on('click', '[data-modal]', click );


    $(document).on('submit', 'form.modal-form, .modal-form form', function(form, modal_blocker) {
        form = $(this);
        console.log(form)
        modal_blocker = form.parents('.___modal_blocker').eq(0)
        $.ajax({
            method: form.attr('method'),
            url: form.attr('action'),
            data: form.serializeArray(),
            success: function(data) {
                if(data.redirect) {
                    document.location.href = data.redirect;
                }
                else if(data.modal) {
                    $(data.modal).eq(0).sectionsModal();
                }
                else {
                    var data = $(data);
                    console.log(data)
                    if(data.is('html')) {
                        $('html').replaceWith(data);
                    }
                    else {
                        $(data).addClass('in');
                        modal_blocker.find('.app-modal').eq(0).replaceWith(data)
                    }

                }
            }
        })
        return false;
    });
    $(window).click(function(e) {
        //console.log('window', CLOSE_BLOCKED)
        CLOSE_BLOCKED = false;
    });
});

//var CURRENT_MODALS = [];

(function($, blocker, CURRENT_MODALS, MODAL_CLOSE_FCT) {
    CURRENT_MODALS = [];
    var current = null;

    MODAL_CLOSE_FCT = function(data) {
        if($(data['modal']).parent().hasClass('___modal_wrapper')) {
            $(data['modal']).unwrap().unwrap();
            $('body').removeClass('___modal_open_body');
            data.MODAL_OPTIONS = null;
            $(data['modal']).removeClass('in')
        }
        var index = CURRENT_MODALS.indexOf(self);
        if (index > -1) {
            CURRENT_MODALS.splice(index, 1);
        }
    }

    $.fn.sectionsModal = function( options, self, $self, data, $blocker) {

        $self = $(this);
        self = $self[0];
        data = {}

        if(options && options.target) {
            var loading = $('<div></div>').appendTo('body').addLoading().sectionsModal()
            $.get(options.target, null, function(data) {
                //MODAL_BLOCKER.removeLoading();
                //$(data).eq(0).modal();
                data = $(data).hide().addClass('in')
                loading.replaceWith(data.fadeIn())
                if(options.open) {
                    options.open(data);
                }
            });
        }

        else if(options == 'close' && $(self).parent().hasClass('___modal_wrapper')) {


            $(self).removeClass('in').parent().parent().remove();//.unwrap().unwrap();

            // if(self.floating_modal || $(self).parent().is('body')) {
            //     $self.remove();
            // }
            // $('body .sections-modal').remove();
            if( !$('.___modal_wrapper').length) {
                $('body').removeClass('___modal_open_body');

            }

        }
        else {

            data['modal'] = self;
            data['floating'] = false;

            if(!$self.parent().length) {
                $self.appendTo('body');
                self.floating_modal = true;
            }
            CURRENT_MODALS.push(data)
            data.MODAL_OPTIONS = $.extend({

            }, options);

            $('body').removeClass('___modal_open_body');

            console.log($self)

            $self.wrap('<div class="___modal_wrapper"></div>');
            $self.parent().wrap('<div class="___modal_blocker"></div>');

            data.MODAL_WRAPPER = $self.parent();
            data.MODAL_BLOCKER = data.MODAL_WRAPPER.parent().on('click', function(event) {


                if($(event.target).hasClass('___modal_wrapper')) {
                    $(event.target).find(">*").eq(0).sectionsModal('close');
                }
                if($(event.target).hasClass('___modal_blocker')) {
                    $(event.target).find(">*>*").eq(0).sectionsModal('close');
                }
            });
            //setTimeout(function() {

                data.MODAL_BLOCKER.addClass('in')
                data.MODAL_WRAPPER.addClass('in')
                data.MODAL_WRAPPER.find(">*").addClass('in')


                if(data.MODAL_OPTIONS.onOpen) {
                    data.MODAL_OPTIONS.onOpen(self)
                }
            //}, 200)

             data.MODAL_BLOCKER.on('click', '.sections-modal-close', function() {
                data.MODAL_BLOCKER.find(">*>*").eq(0).sectionsModal('close');
            });

            data.MODAL_BLOCKER.MODAL_DATA = data;

        }
        return $self;

    };

    $.sectionsModal = {
        close: function() {

            // for(var i in CURRENT_MODALS) {
            //     console.log(CURRENT_MODALS[i], CURRENT_MODALS[i].MODAL_CLOSE_FCT)
            //     CURRENT_MODALS[i].MODAL_CLOSE_FCT();
            // }
            $('.___modal_wrapper').find('> *').each(function() {
                //console.log(this)
                $(this).sectionsModal('close');
            })
        },
        fit: function() {

        }
    };


})(jQuery);