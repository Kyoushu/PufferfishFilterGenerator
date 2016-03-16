(function($, window, document, undefined){

    Handlebars.registerHelper('ifEqual', function(v1, v2, options) {
        if(v1 === v2) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    var generator = function(node, options){

        var defaults = {
            'template_url': null,
            'quality_choices': [25,50,75,80,90,100],
            'default_quality': 80,
            'type_choices': {
                'thumbnail': 'Thumbnail',
                'widen': 'Widen'
            },
            'resizer_choices': {
                'liip': 'liip/imagine-bundle',
                'avalanche': 'avalanche123/imagine-bundle'
            }
        };

        options = $.extend({}, defaults, options);
        this.options = options;

        if(!options.template_url) throw 'template_url not provided';

        var generator = this;
        var container = $(node);

        $.ajax(options.template_url, {
            'success': function(html){

                var template = Handlebars.compile(html);

                container.empty().html(
                    template({
                        'options': options
                    })
                );

                generator.form = container.find('[data-pufferfish-filter-generator-form]');
                generator.output = container.find('[data-pufferfish-filter-generator-output]');

                generator.output.on('click', function(){
                    generator.output.select();
                });

                generator.getFields().on('keyup change paste', function(e){

                    var field = $(this);

                    var updateConfigJson = true;
                    if(field.attr('name') == 'config_json'){
                        updateConfigJson = false;
                    }

                    generator.generateOutput(updateConfigJson)
                });

                generator.form.on('submit', function(e){
                    e.preventDefault();
                    generator.generateOutput();
                });

                generator.generateOutput(true);

            }
        });

    };

    generator.prototype.options = null;
    generator.prototype.form = null;
    generator.prototype.output = null;

    generator.prototype.getFields = function(){
        return this.form.find('input,select');
    };

    generator.prototype.getData = function(){

        var data = {};

        this.getFields().each(function(){
            var element = $(this);
            var key = element.attr('name');
            if(key === 'config_json') return;
            if(!key) return;
            data[key] = element.val();
        });

        return data;

    };

    generator.prototype.getConfig = function(){

        var configJson = this.form.find('input[name=config_json]').val();
        if(!configJson) return null;
        var config = JSON.parse(configJson);

        if(typeof config !== 'object') return null;

        var defaults = {
            'prefix': 'default',
            'resizer': 'liip',
            'lower_width': 100,
            'upper_width': 1200,
            'iterations': 6,
            'aspect_ratio': 1.333,
            'type': 'thumbnail',
            'jpeg_quality': 80
        };

        return $.extend({}, defaults, config);

    };

    generator.prototype.applyConfig = function(config){

        var form = this.form;

        $.each(config, function(key, value){
            var field = form.find('[name=' + key + ']');
            field.val(value);
        });

    };

    generator.prototype.generateOutput = function(updateConfigJson){

        if(typeof updateConfigJson === 'undefined') updateConfigJson = false;

        if(updateConfigJson){
            this.form.find('input[name=config_json]').val( JSON.stringify(this.getData()) );
        }

        var config = this.getConfig();
        if(config !== null){
            this.applyConfig(config);
        }

        var data = this.getData();

        if(data.resizer === 'liip'){
            this.generateLiipOutput();
        }
        else{
            this.generateAvalancheOutput();
        }
    };

    generator.prototype.generateLiipFilterOutput = function(prefix, type, width, height, jpeg_quality){

        var output = [];

        output.push(prefix + '_' + width + ':');
        output.push('    jpeg_quality: ' + jpeg_quality);
        output.push('    filters:');
        output.push('        upscale: { min: [' + width + ', ' + height + '] }');
        if(type === 'thumbnail'){
            output.push('        thumbnail: { size: [' + width + ', ' + height + '], mode: outbound, allow_upscale: true }');
        }
        if(type === 'widen'){
            output.push('        relative_resize: { widen: ' + width + ' }');
        }

        return output.join("\n");

    };

    generator.prototype.generateLiipOutput = function(){

        var data = this.getData();
        var output = [];

        output.push('# Generated with Kyoushu/PufferfishFilterGenerator (https://github.com/Kyoushu/PufferfishFilterGenerator)');
        output.push('# Parameters: ' + JSON.stringify(data));
        output.push('');

        var widthDiff = parseInt(data.upper_width) - parseInt(data.lower_width);

        var width, height;
        var jpeg_quality = data.jpeg_quality;

        if(data['iterations'] === 1){
            width = parseInt(data.lower_width);
            height = Math.round(parseInt(data.lower_width) / parseFloat(data.aspect_ratio));
            output.push( this.generateLiipFilterOutput(data.prefix, data.type, width, height) );
            output.push('');
        }
        else{
            var increment = widthDiff / (parseInt(data.iterations) - 1);

            for(var i = 0; i < parseInt(data.iterations); i++){
                width = parseInt(data.lower_width) + Math.round(increment * i);
                height = Math.round(width / parseFloat(data.aspect_ratio));
                output.push( this.generateLiipFilterOutput(data.prefix, data.type, width, height, jpeg_quality) );
                output.push('');
            }
        }

        this.output.val( output.join("\n") );

    };

    generator.prototype.generateAvalanceFilterOutput = function(prefix, type, width, height){
        var output = [];

        output.push(prefix + '_' + width + ':');

        if(type === 'widen'){
            output.push('    type: relative_resize');
            output.push('    options: { widen: ' + width + ' }');
        }
        else if(type === 'thumbnail'){
            output.push('    type: thumbnail');
            output.push('    options: { size: [' + width + ', ' + height + '], mode: outbound }');
        }

        return output.join("\n");
    };

    generator.prototype.generateAvalancheOutput = function(){

        var data = this.getData();
        var output = [];

        output.push('# Generated with Kyoushu/PufferfishFilterGenerator (https://github.com/Kyoushu/PufferfishFilterGenerator)');
        output.push('# Parameters: ' + JSON.stringify(data));
        output.push('');

        var widthDiff = parseInt(data.upper_width) - parseInt(data.lower_width);

        var width, height;

        if(data['iterations'] === 1){
            width = parseInt(data.lower_width);
            height = Math.round(parseInt(data.lower_width) / parseFloat(data.aspect_ratio));
            output.push(this.generateAvalanceFilterOutput(data.prefix, data.type, width, height));
            output.push('');
        }
        else{
            var increment = widthDiff / (parseInt(data.iterations) - 1);

            for(var i = 0; i < parseInt(data.iterations); i++){
                width = parseInt(data.lower_width) + Math.round(increment * i);
                height = Math.round(width / parseFloat(data.aspect_ratio));
                output.push(this.generateAvalanceFilterOutput(data.prefix, data.type, width, height));
                output.push('');
            }
        }

        this.output.val( output.join("\n") );

    };

    $.fn.pufferfishFilterGenerator = function(options){
        $(this).each(function(){
            $(this).data('pufferfishFilterGenerator', new generator(this, options));
        });
    };

})( jQuery, window, window.document);