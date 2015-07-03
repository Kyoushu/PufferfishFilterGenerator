define(['jquery'], function($){

    var generator = function(node){

        var generator = this;
        var container = $(node);

        this.form = container.find('[data-pufferfish-filter-generator-form]');
        this.output = container.find('[data-pufferfish-filter-generator-output]');

        this.output.on('click', function(){
            generator.output.select();
        });

        this.getFields().on('keyup', function(){ generator.generateOutput() });
        this.getFields().on('change', function(){ generator.generateOutput() });

        this.form.on('submit', function(e){
            e.preventDefault();
            generator.generateOutput();
        });

        this.generateOutput();

    };

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
            if(!key) return;
            var value = element.val();
            data[key] = value;
        });

        return data;

    };

    generator.prototype.generateOutput = function(){
        var data = this.getData();
        if(data.resizer === 'liip'){
            this.generateLiipOutput();
        }
        else{
            this.generateAvalancheOutput();
        }
    };

    generator.prototype.generateLiipOutput = function(){

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

            output.push(data.prefix + '_' + width + ':');
            output.push('    filters:');
            output.push('        thumbnail: { size: [' + width + ', ' + height + '], mode: outbound }');
            output.push('');
        }
        else{
            var increment = widthDiff / (parseInt(data.iterations) - 1);

            for(var i = 0; i < parseInt(data.iterations); i++){

                width = parseInt(data.lower_width) + Math.round(increment * i);
                height = Math.round(width / parseFloat(data.aspect_ratio));

                output.push(data.prefix + '_' + width + ':');
                output.push('    filters:');
                output.push('        thumbnail: { size: [' + width + ', ' + height + '], mode: outbound }');
                output.push('');

            }
        }

        this.output.val( output.join("\n") );

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

            output.push(data.prefix + '_' + width + ':');
            output.push('    type: thumbnail');
            output.push('    options: { size: [' + width + ', ' + height + '], mode: outbound }');
            output.push('');
        }
        else{
            var increment = widthDiff / (parseInt(data.iterations) - 1);

            for(var i = 0; i < parseInt(data.iterations); i++){

                width = parseInt(data.lower_width) + Math.round(increment * i);
                height = Math.round(width / parseFloat(data.aspect_ratio));

                output.push(data.prefix + '_' + width + ':');
                output.push('    type: thumbnail');
                output.push('    options: { size: [' + width + ', ' + height + '], mode: outbound }');
                output.push('');

            }
        }

        this.output.val( output.join("\n") );

    };

    return generator;

});
