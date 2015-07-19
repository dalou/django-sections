
$.fn.addLoadingFull = function() {

    $('#loading').remove();
    $loading = $("<div id='loading'>\
      <div class='uil-reload-css' style='-webkit-transform:scale(0.57)' ><div></div></div>\
    </div>");
    $('body').append($loading);

    return this;
}

$.fn.removeLoadingFull = function() {

    $('#loading').remove();
    return this
}

$.fn.addLoadingError = function(text) {
    $(this).addLoading(text, true);
}

$.fn.addLoading = function(text, error) {
    if( !$(this).find('> .uil-reload-css').length ) {
        $loading = $("<div class='uil-reload-css uil-reload-css-rl __loading_spinner' style='-webkit-transform:scale(0.57)'>\
          <span class='uil-reload-text'></span><div></div>\
        </div>");
        // $loading = $('<div class="spinner __loading_spinner">\
        //           <div class="bounce1"></div>\
        //           <div class="bounce2"></div>\
        //           <div class="bounce3"></div>\
        //         </div>').hide()
        $(this).append($loading).addClass('loading');
        if(error) {
            $loading.addClass('error');
        }
        else {
            $loading.removeClass('error');
        }
        $loading.fadeIn(300);
    }
    if(text) {
        $(this).find('.uil-reload-text').html(text)
        if(error) {
            $(this).find('> .uil-reload-css').addClass('error')
        }
        else {
            $(this).find('> .uil-reload-css').removeClass('error');
        }
    }
    // $loading = $('<div class="loading2-wrapper __loading_spinner">\
    //           <div class="loading2"></div>\
    //         </div>')
    // $(this).append($loading).addClass('loading');

    return this;
}
$.fn.removeLoading = function($self) {
    $self = $(this);
    $(this).find('.__loading_spinner').fadeOut(250, function() {
        $(this).remove();
        $self.removeClass('loading')
    })
    // $(this).removeClass('loading').find('.__loading_spinner').fadeOut(250, function() {
    //     $(this).remove()
    // })
}
$(document).ready(function() {
    // $('[data-image-loading]').addLoading().imagesLoaded(function() {
    //     $(this).removeLoading();
    // })

    // $('[data-loading]').addLoading();
});