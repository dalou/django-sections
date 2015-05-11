sections_plugins['char'] = function($iframe, $field, options) {

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