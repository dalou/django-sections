 $(document).on('mouseover', '[data-tooltip]', function(content) {

    if(!this.tooltiptized_over) {
        var data = $(this).data('tooltip');
        if(data.target)
        {
            content = $(data.target);
        }
        else {
            content = $('<div>'+data+'</div>');
        }
        data = $.extend({
            delay: 0,
            content: content
        }, data);
        $(this).tooltipster(data);
        this.tooltiptized_over = true;
        if(!data.trigger || data.trigger == "hover") {
            $(this).tooltipster('show')
        }

    }
});