requirejs.config({
    'baseUrl': 'js'
});

require(['Pufferfish/FilterGenerator/Generator'], function(generator){

    $('[data-pufferfish-filter-generator]').each(function(){
        new generator(this);
    });

});