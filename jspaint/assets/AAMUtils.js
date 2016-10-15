// JavaScript Document

/*
	EX.
	AAMLocalizeUtil.addText("big", {ja:ookii, en:big});
	var txt = AAMLocalizeUtil.getText(key);
*/
var AAMLocalizeUtil = function(){}
AAMLocalizeUtil._table;
AAMLocalizeUtil.addText = function(key, langSet)
{
	if(!AAMLocalizeUtil._table)
		AAMLocalizeUtil._table = {};
		
	AAMLocalizeUtil._table[key] = langSet;
}

AAMLocalizeUtil.getText = function(key)
{
	var lang = navigator.language.substr(0,2)
	var data = AAMLocalizeUtil._table[key];
	if(data){
		var txt = data[lang];
		if(txt){
			return txt;
		}else{
			return data["en"];
		}
	}
	return undefined;
}


/*
--------------------------------------
	RGB Color Data
--------------------------------------
*/
var AAMRGBColor = function(r,g,b){
	this.r = r;
	this.g = g;
	this.b = b;
};
AAMRGBColor.prototype.r = 0;
AAMRGBColor.prototype.g = 0;
AAMRGBColor.prototype.b = 0;
AAMRGBColor.prototype.cssString = function()
{
	return "rgb(" + Math.round(this.r) + "," + Math.round(this.g) + "," + Math.round(this.b) + ")";
}
AAMRGBColor.prototype.setCssString = function(str)
{
	//check #ffffff
	var reg = new RegExp("#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})", "i");
	if(reg.exec(str))
	{
		this.r = parseInt(RegExp.$1, 16)
		this.g = parseInt(RegExp.$2, 16)
		this.b = parseInt(RegExp.$3, 16)
	}
	return this;
}



/*
--------------------------------------
	HSB Color Data
--------------------------------------
*/
var AAMHSBColor = function(h,s,b){
	this.h = h;
	this.s = s;
	this.b = b;
}
AAMHSBColor.prototype.h = 0;
AAMHSBColor.prototype.s = 0;
AAMHSBColor.prototype.b = 0;



/*
--------------------------------------
	RGB Color Data
--------------------------------------
*/
var AAMColorUtil = function(){}
AAMColorUtil.rgb2hsb = function(r, g, b)
{
	r = (r<0)?0:(r>255)?255:Math.round(r);
	g = (g<0)?0:(g>255)?255:Math.round(g);
	b = (b<0)?0:(b>255)?255:Math.round(b);
	var min = Math.min(r,g,b);
	var max = Math.max(r,g,b);
	if(max==0){
		return new AAMHSBColor(0,0,0);
	}else{
		var sat = (max-min)/max*100;
	}
	bri = max/255*100;
	hue = AAMColorUtil._getHue(r,b,g,max,min);
	return new AAMHSBColor(hue,sat,bri);
}

AAMColorUtil.hsb2rgb = function(hue, sat, bri)
{
	hue = (hue<0)? hue % 360 + 360 : (hue>=360)? hue%360 : hue;
	sat = (sat<0)? 0 : (sat>100)? 100 : sat;
	bri = (bri<0)? 0 : (bri>100)? 100 : bri;
	
	sat *= 0.01;
	bri *= 0.01;
	var val;
	if(sat==0){
		val = bri*255;
		return new AAMRGBColor(val, val, val);
	}
	
	var max = bri * 255;
	var min = max*(1-sat);
	return AAMColorUtil._hMinMax2RGB(hue, min, max);
}

AAMColorUtil._getHue = function(r,g,b,max,min)
{
	var range = max - min;
	if(range==0)
		return 0;
		
	var rr = max - r;
	var gg = max - g;
	var bb = max - b;
	var h;
	switch(max){
		case r:
			h = bb-gg;
			break
		case g:
			h = 2 * range + rr - bb;
			break
		case b:
			h = 4 * range + gg - rr;
			break;
	}
	h*=-60;
	h/=range;
	h=(h<0)? h+360 : h;
	
	return h;
}


AAMColorUtil._hMinMax2RGB = function(h, min, max)
{
	var r, g, b;
	var area = Math.floor(h/60);
	switch(area){
		case 0:
			r = max;
			g = min+h*(max-min)/60;
			b = min;
		break;
		case 1:
			r = max-(h-60)*(max-min)/60;
			g = max;
			b = min;
			break;	
		case 2:
			r = min;
			g = max;
			b = min+(h-120)*(max-min)/60;
			break;	
		case 3:
			r = min;
			g = max-(h-180)*(max-min)/60;
			b = max;
			break;	
		case 4:
			r = min+(h-240)*(max-min)/60;
			g = min;
			b = max;
			break;	
		case 5:
			r = max;
			g = min;
			b = max-(h-300)*(max-min)/60;
			break;	
		case 6:
			r = max;
			g = min+h*(max-min)/60;
			b = min;
			break;	
	}
	r = Math.min(255, Math.max(0, Math.round(r)));
	g = Math.min(255, Math.max(0, Math.round(g)));
	b = Math.min(255, Math.max(0, Math.round(b)));
	return new AAMRGBColor(r,g,b);
}