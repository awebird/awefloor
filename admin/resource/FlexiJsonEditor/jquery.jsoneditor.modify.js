/*
    注意，此文件由项目深度定制修改，已不能作为库公用
    需要此功能，请到https://github.com/DavidDurman/FlexiJsonEditor/下载新版
    @lidapeng
 */
// Simple yet flexible JSON editor plugin.
// Turns any element into a stylable interactive JSON editor.

// Copyright (c) 2013 David Durman

// Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).

// Dependencies:

// * jQuery
// * JSON (use json2 library for browsers that do not support JSON natively)

// Example:

//     var myjson = { any: { json: { value: 1 } } };
//     var opt = { change: function() { /* called on every change */ } };
//     /* opt.propertyElement = '<textarea>'; */ // element of the property field, <input> is default
//     /* opt.valueElement = '<textarea>'; */  // element of the value field, <input> is default
//     $('#mydiv').jsonEditor(myjson, opt);

(function( $ ) {

    $.fn.jsonEditor = function(json, options) {
        options = options || {};
        // Make sure functions or other non-JSON data types are stripped down.
        json = parse(stringify(json));
        
        var K = function() {};
        var onchange = options.change || K;
        var onpropertyclick = options.propertyclick || K;

        return this.each(function() {
            JSONEditor($(this), json, onchange, onpropertyclick, options.propertyElement, options.valueElement);
        });
        
    };
    
    function JSONEditor(target, json, onchange, onpropertyclick, propertyElement, valueElement) {
        var opt = {
            target: target,
            onchange: onchange,
            onpropertyclick: onpropertyclick,
            original: json,
            propertyElement: propertyElement,
            valueElement: valueElement
        };
        construct(opt, json, opt.target);
        $(opt.target).on('blur focus', '.property, .value', function() {
            $(this).toggleClass('editing');
        });
    }

    function isObject(o) { return Object.prototype.toString.call(o) == '[object Object]'; }
    function isArray(o) { return Object.prototype.toString.call(o) == '[object Array]'; }
    function isBoolean(o) { return Object.prototype.toString.call(o) == '[object Boolean]'; }
    function isNumber(o) { return Object.prototype.toString.call(o) == '[object Number]'; }
    function isString(o) { return Object.prototype.toString.call(o) == '[object String]'; }
    var types = 'object array boolean number string null';

    // Feeds object `o` with `value` at `path`. If value argument is omitted,
    // object at `path` will be deleted from `o`.
    // Example:
    //      feed({}, 'foo.bar.baz', 10);    // returns { foo: { bar: { baz: 10 } } }
    function feed(o, path, value) {
        var del = arguments.length == 2;
        
        if (path.indexOf('.') > -1) {
            var diver = o,
                i = 0,
                parts = path.split('.');
            for (var len = parts.length; i < len - 1; i++) {
                diver = diver[parts[i]];
            }
            if (del) delete diver[parts[len - 1]];
            else diver[parts[len - 1]] = value;
        } else {
            if (del) delete o[path];
            else o[path] = value;
        }
        return o;
    }

    // Get a property by path from object o if it exists. If not, return defaultValue.
    // Example:
    //     def({ foo: { bar: 5 } }, 'foo.bar', 100);   // returns 5
    //     def({ foo: { bar: 5 } }, 'foo.baz', 100);   // returns 100
    function def(o, path, defaultValue) {
        path = path.split('.');
        var i = 0;
        while (i < path.length) {
            if ((o = o[path[i++]]) == undefined) return defaultValue;
        }
        return o;
    }

    function error(reason) { if (window.console) { console.error(reason); } }
    
    function parse(str) {
        var res;
        try { res = JSON.parse(str); }
        catch (e) { res = null; error('JSON parse failed.'); }
        return res;
    }

    function stringify(obj) {
        var res;
        try { res = JSON.stringify(obj); }
        catch (e) { res = 'null'; error('JSON stringify failed.'); }
        return res;
    }
    
    function addExpander(item) {
        if (item.children('.expander').length == 0) {
            var expander =   $('<span>',  { 'class': 'expander' });
            expander.bind('click', function() {
                var item = $(this).parent();
                item.toggleClass('expanded');
            });
            item.prepend(expander);
        }
    }

    function addListAppender(item, handler) {
        //!!!!!暂时隐藏新增楼层div 待需要是开启!!!!!
        var appender = $('<div style="display:none;">', { 'class': 'item appender add_floor_div' }),
            //新增楼层 增加模板选择
            type_label      = $('<label>请选择模板新建楼层</label>', { 'class': 'add_label' });
            select_box      = $('<select id="type_chosen"><option value="1" selected="selected" >1 整张大图</option><option value="2">2 左1右2</option><option value="3">3 左2右1</option><option value="4">4 左1右4</option><option value="5">5 左4右1</option></select>', { 'class': 'floor_types' });
            btn      = $('<button></button>', { 'class': 'add_floor' });

        btn.text('点击新建楼层');

        appender.append(type_label).append(select_box).append(btn);
        item.append(appender);

        btn.click(handler);

        return appender;
    }

    function addNewValue(json) {
        var new_value=null;
        type_selected=$('#type_chosen').val();
        type_json=tpls.floor_tpls[type_selected-1];
        type_json.floor_id=total_floor+1;

        if (isArray(json)) {
            //json.push(null);
            json.push(type_json);
            return true;
        }

        if (isObject(json)) {
            var i = 1, newName = "newKey";

            while (json.hasOwnProperty(newName)) {
                newName = "newKey" + i;
                i++;
            }

            json[newName] = null;
            return true;
        }

        return false;
    }
    
    //由属性获取描述文字
    function getPropertyDesc(property_str){
        property_str=property_str.replace('img','图片');
        property_str=property_str.replace('text','文字');
        property_str=property_str.replace('link','链接');
        property_str=property_str.replace('desc','图片描述');
        property_str=property_str.replace('left','左');
        property_str=property_str.replace('right','右');
        property_str=property_str.replace('top','上');
        property_str=property_str.replace('bottom','下');

        property_str=property_str.replace('floors','楼层信息');
        property_str=property_str.replace('floor_id','所在楼层');
        property_str=property_str.replace('style','楼层模板');
        property_str=property_str.replace('content','详细信息');
        property_str=property_str.replace('brands','ALL_STAR');
        property_str=property_str.replace(/_/g,'');

        //楼层数组key描述显示+1
        if(property_str.match(/^[0-9]+$/)){
            property_str=parseInt(property_str)+1;
        }

        return property_str;
    }

    //由style获取楼层模板描述文字
    function getStyleDesc(style_id){
        switch(style_id){
            case '1': style_desc="整张大图";break;
            case '2': style_desc="左1右2";break;
            case '3': style_desc="左2右1";break;
            case '4': style_desc="左1右4";break;
            case '5': style_desc="左4右1";break;
            default: style_desc="未定义模板";
        }
        return style_desc;
    }

    function construct(opt, json, root, path) {
        path = path || '';
        
        root.children('.item').remove();
        
        for (var key in json) {
            if (!json.hasOwnProperty(key)) continue;

            var item     = $('<div>',   { 'class': 'item', 'data-path': path }),
                property =   $(opt.propertyElement || '<input>', { 'class': 'property' }),
                value    =   $(opt.valueElement || '<input>', { 'class': 'value'    });

            if (isObject(json[key]) || isArray(json[key])) {
                addExpander(item);
            }
            
            //增加属性描述文字
            var desc_lable='<label class="property_desc">'+getPropertyDesc(key)+'</label>';
            item.append(desc_lable).append(property).append(value);
            //item.append(property).append(value);
            //增加楼层模板描述信息
            if(key=='style'){
                item.append('<label style="width:70px;font-size:0.8em;background-color:yellow;">'+getStyleDesc(json[key])+'<label>');
            }
            root.append(item);
            
            //ldp 只有最末级才可以修改
            property.val(key).attr('title', key).attr('readonly','readonly');
            //ldp 只有最末级才可以修改
            var val = stringify(json[key]);
            //ldp 只有最末级才可以修改
            if (isObject(json[key]) || isArray(json[key])) {
                value.val(val).attr('title', val).attr('readonly','readonly').hide();
            }else{
                //去掉左右的双引号
                var reg = new RegExp('"',"g");
                //val = val.replace(reg, "");
                value.val(val).attr('title', val);
                var title_this = property.attr('title');
                if(title_this.substr(title_this.length-3,3)=='img'){
                    var img_seq_inner=img_seq++;
                    value.attr('readonly','readonly').css({backgroundColor:"grey"}).attr('id','xImagePath'+img_seq).addClass('img_input');
                    value.after('<input type=\"button\" value=\"选择图片\" onclick=\"BrowseServer( \'Images:\/\', \'xImagePath'+img_seq+'\' );" \/><img class=\"bird_eye\" src=\"..\/'+json[key]+'\" />');
                }
                //楼层和模板暂时不可编辑
                if(title_this=='floor_id' || title_this=='style'){
                    value.attr('readonly','readonly').css({backgroundColor:"grey"});
                }
            }
            //ldp 只有最末级才可以修改

            assignType(item, json[key]);

            property.change(propertyChanged(opt));
            value.change(valueChanged(opt));
            property.click(propertyClicked(opt));
            
            if (isObject(json[key]) || isArray(json[key])) {
                construct(opt, json[key], item, (path ? path + '.' : '') + key);
            }
        }

        if (isObject(json) || isArray(json)) {
            if(root.children('.property').attr('title')=='floors'){
                //如果为楼层的最后增加“新建楼层功能”
                addListAppender(root, function () {
                    if( confirm("请确认是否要根据此模板新建楼层？") ){
                        addNewValue(json);
                        construct(opt, json, root, path);
                        opt.onchange(parse(stringify(opt.original)));
                    }
                });
            }
        }
    }

    function updateParents(el, opt) {
        $(el).parentsUntil(opt.target).each(function() {
            var path = $(this).data('path');
            path = (path ? path + '.' : path) + $(this).children('.property').val();
            var val = stringify(def(opt.original, path, null));
            $(this).children('.value').val(val).attr('title', val);
        });
    }

    function propertyClicked(opt) {
        return function() {
            var path = $(this).parent().data('path');            
            var key = $(this).attr('title');

            var safePath = path ? path.split('.').concat([key]).join('\'][\'') : key;
            
            opt.onpropertyclick('[\'' + safePath + '\']');
        };
    }
    
    function propertyChanged(opt) {
        return function() {
            var path = $(this).parent().data('path'),
                val = parse($(this).next().val()),
                newKey = $(this).val(),
                oldKey = $(this).attr('title');

            $(this).attr('title', newKey);

            feed(opt.original, (path ? path + '.' : '') + oldKey);
            if (newKey) feed(opt.original, (path ? path + '.' : '') + newKey, val);

            updateParents(this, opt);

            if (!newKey) $(this).parent().remove();
            
            opt.onchange(parse(stringify(opt.original)));
        };
    }

    function valueChanged(opt) {
        return function() {
                //ldp 先去掉所有双引号 
                var tmp_val = $(this).val();
                var reg = new RegExp('"',"g");
                var tmp_val =tmp_val.replace(reg, "");
                //ldp 如果录入数据两边没有双引号，则补充 
                if(tmp_val.charAt(0)!='"'){
                    tmp_val='"'+tmp_val;
                }
                if(tmp_val.charAt(tmp_val.length-1)!='"'){
                    tmp_val=tmp_val+'"';
                }
                $(this).val(tmp_val);
             //ldp
            var key = $(this).prev().val(),
                //val = parse('"'+$(this).val()+'"' || 'null'),
                //val = parse($(this).val() || 'null'),
                val = parse($(this).val() || ''),
                item = $(this).parent(),
                path = item.data('path');

            feed(opt.original, (path ? path + '.' : '') + key, val);
            if ((isObject(val) || isArray(val)) && !$.isEmptyObject(val)) {
                construct(opt, val, item, (path ? path + '.' : '') + key);
                addExpander(item);
            } else {
                item.find('.expander, .item').remove();
            }

            assignType(item, val);

            updateParents(this, opt);
            
            opt.onchange(parse(stringify(opt.original)));
        };
    }
    
    function assignType(item, val) {
        var className = 'null';
        
        if (isObject(val)) className = 'object';
        else if (isArray(val)) className = 'array';
        else if (isBoolean(val)) className = 'boolean';
        else if (isString(val)) className = 'string';
        else if (isNumber(val)) className = 'number';

        item.removeClass(types);
        item.addClass(className);
    }

})( jQuery );
