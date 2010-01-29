function hsvToRgb(h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;
	
	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));
	
	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100;
	
	if(s == 0) {
		// Achromatic (grey)
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
	
	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));

	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
			
		case 1:
			r = q;
			g = v;
			b = p;
			break;
			
		case 2:
			r = p;
			g = v;
			b = t;
			break;
			
		case 3:
			r = p;
			g = q;
			b = v;
			break;
			
		case 4:
			r = t;
			g = p;
			b = v;
			break;
			
		default: // case 5:
			r = v;
			g = p;
			b = q;
	}
	
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

function hsvToHex(h,s,v){
    var rgb = hsvToRgb(h,s,v);
    return '' + rgb[0].toString(16) + rgb[1].toString(16) + rgb[2].toString(16);
};

jQuery.ColorPicker = function(container, options) {
    settings = jQuery.extend({
        imagepath: ''
    }, options);
    
    var picker = this;
    
    picker.build = function(){
        // Container setup
        var container = picker.el.container
            .empty()
            .css({
                'display': 'block',
                'position': 'relative',
                'width': '312px',
                'height': '272px',
                'background': '#404040'
            });
        
        // Wheel setup
        var wheel_container = picker.el.wheel_container = jQuery('<div/>')
            .css({
                'position': 'absolute',
                'z-index': '1',
                'top': '8px',
                'left': '8px',
                'width': '272px',
                'height': '272px;'
            }).appendTo(container);
        var wheel_bg = picker.el.wheel_bg = jQuery('<div/>')
            .css({
                'position': 'absolute',
                'z-index': '2',
                'top': '0',
                'left': '0',
                'width': '256px',
                'height': '256px',
                'background': 'url(' + settings.imagepath + 'jquery.colorpicker.wheel_bg.png)'
            }).appendTo(wheel_container);
        var wheel = picker.el.wheel = jQuery('<div/>')
            .css({
                'position': 'absolute',
                'z-index': '3',
                'top': '0',
                'left': '0',
                'width': '256px',
                'height': '256px',
                'background': 'url(' + settings.imagepath + 'jquery.colorpicker.wheel.png)'
            }).appendTo(wheel_container);
        var wheel_cursor = picker.el.wheel_cursor = jQuery('<div/>')
            .css({
                'position': 'absolute',
                'z-index': '4',
                'top': '120px',
                'left': '120px',
                'width': '16px',
                'height': '16px',
                'background': 'url(' + settings.imagepath + 'jquery.colorpicker.wheel_cursor.png)'
            }).appendTo(wheel_container);
        var wheel_hit = picker.el.wheel_hit = jQuery('<div/>')
            .css({
                'position': 'absolute',
                'z-index': '5',
                'top': '-8px',
                'left': '-8px',
                'width': '272px',
                'height': '272px'
            }).appendTo(wheel_container);
        
        // Slider setup
        var slider_container = picker.el.slider_container = jQuery('<div/>')
            .css({
                'position': 'absolute',
                'z-index': '1',
                'top': '8px',
                'left': '280px',
                'width': '24px',
                'height': '256px;'
            }).appendTo(container);
        var slider_bg = picker.el.slider_bg = jQuery('<div/>')
            .css({
                'position': 'absolute',
                'z-index': '2',
                'top': '0',
                'left': '0',
                'width': '16px',
                'height': '256px',
                'background': picker.color.hex
            }).appendTo(slider_container);
        var slider = picker.el.slider = jQuery('<div/>')
            .css({
                'position': 'absolute',
                'z-index': '3',
                'top': '0',
                'left': '0',
                'width': '16px',
                'height': '256px',
                'background': 'url(' + settings.imagepath + 'jquery.colorpicker.slider.png)'
            }).appendTo(slider_container);
        var slider_cursor = picker.el.slider_cursor = jQuery('<div/>')
            .css({
                'position': 'absolute',
                'z-index': '4',
                'top': '-8px',
                'left': '8px',
                'width': '16px',
                'height': '16px',
                'background': 'url(' + settings.imagepath + 'jquery.colorpicker.slider_cursor.png)'
            }).appendTo(slider_container);
        var slider_hit = picker.el.slider_hit = jQuery('<div/>')
            .css({
                'position': 'absolute',
                'z-index': '5',
                'top': '-8px',
                'left': '-8px',
                'width': '40px',
                'height': '272px'
            }).appendTo(slider_container);
        
        // events
        wheel_hit.mousedown(function(){ picker.mouse.wheel = true; });
        wheel_hit.mouseup(function(){ picker.mouse.wheel = false; });
        wheel_hit.mouseout(function(){ picker.mouse.wheel = false; });
        
        slider_hit.mousedown(function(){ picker.mouse.slider = true; });
        slider_hit.mouseup(function(){ picker.mouse.slider = false; });
        slider_hit.mouseout(function(){ picker.mouse.slider = false; });
        
        jQuery(window).mousemove(function(e){
            if (picker.mouse.slider) {
                var pxOffset = Math.max(0, Math.min(255, e.pageY - Math.round(slider.offset().top)));
                var val = Math.round(100 - (pxOffset * 0.390625));
                picker.el.slider_cursor.css('top', pxOffset - 8 + 'px');
                picker.color.val =  val;
                picker.color.hex = '#' + hsvToHex(picker.color.hue, picker.color.sat, picker.color.val);
                
                var fullVal = '#' + hsvToHex(picker.color.hue, picker.color.sat, 100);
                picker.el.slider_bg.css('background', fullVal);
                
                picker.el.wheel.css('opacity', picker.color.val / 100);
                
                picker.fn.change(picker.color.hex);
            } else
            if (picker.mouse.wheel) {
                var x = Math.max(0, Math.min(255, e.pageX - Math.round(wheel.offset().left)));
                var y = Math.max(0, Math.min(255, e.pageY - Math.round(wheel.offset().top)));
                var d = Math.sqrt(Math.pow(x-picker.math.center.x,2) + Math.pow(y-picker.math.center.y,2));
                if (d <= picker.math.radius) {
                    picker.el.wheel_cursor.css({'top': y-8+'px', 'left': x-8+'px'});
                    picker.color.hue = Math.round(Math.atan2((picker.math.center.y - y), (picker.math.center.x - x)) * 180/Math.PI) - 90;
                    if (picker.color.hue < 0) { picker.color.hue += 360; }
                    picker.color.sat = Math.round(d/128 * 100);
                    
                    picker.color.hex = hsvToHex(picker.color.hue, picker.color.sat, picker.color.val);
                
                    var fullVal = hsvToHex(picker.color.hue, picker.color.sat, 100);
                    picker.el.slider_bg.css('background', '#' + fullVal);
                    
                    picker.fn.change('#' + picker.color.hex);
                };
            };
        });
    };
    
    picker.change = function(fn) {
        picker.fn.change = fn;
    };
    
    picker.init = function(){
        picker.fn = {};
        picker.fn.change = function(h){};
        picker.el = {};
        picker.el.container = jQuery(container);
        picker.mouse = {};
        picker.mouse.wheel = false;
        picker.mouse.slider = false;
        picker.math = {};
        picker.math.center = {x: 128, y: 128};
        picker.math.radius = 128;
        picker.color = {};
        picker.color.hue = 0;
        picker.color.sat = 0;
        picker.color.val = 100;
        picker.color.hex = "#ffffff";
        picker.build();
        return picker;
    };
    return picker.init();
};
