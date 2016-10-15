// JavaScript Document

/*
---------------------------------
	Geometric classes
---------------------------------
*/
var AAMPoint = function(x, y){
	this.x = x;
	this.y = y;
};
AAMPoint.prototype.x;
AAMPoint.prototype.y;

var AAMRectangle = function(x,y,w,h){
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
}
AAMRectangle.prototype.x;
AAMRectangle.prototype.y;
AAMRectangle.prototype.w;
AAMRectangle.prototype.h;

AAMRectangle.prototype.contains = function(x,y)
{
	if(x>=this.x && x<=this.x+this.width && y>=this.y && y<= this.y+this.height){
		return true;
	}
	return false;
}


/*
---------------------------------
	Geometric classes
---------------------------------
*/

var AAMShortcutManager = function(){}
AAMShortcutManager._table = {}
AAMShortcutManager._alt = "_a";
AAMShortcutManager._shift = "_s";
AAMShortcutManager._ctrl = "_c";
AAMShortcutManager.init = function()
{
	window.onkeydown = AAMShortcutManager._keyDownHandler;
}

//Use CharCode
AAMShortcutManager.addShortcut = function (char,isCtrl, isAlt, isShift, func)
{
	AAMShortcutManager._table[ AAMShortcutManager._createKey(char,isCtrl, isAlt, isShift) ] = func;
}

AAMShortcutManager.removeShortcut = function(char,isCtrl, isAlt, isShift, func)
{
	AAMShortcutManager._table[ AAMShortcutManager._createKey(char,isCtrl, isAlt, isShift) ] = undefined;
}

AAMShortcutManager._keyDownHandler = function(e)
{
	//console.log(key, e.keyCode, e.ctrlKey  , e.altKey, e.shiftKey);
	var key = AAMShortcutManager._createKey(e.keyCode, e.ctrlKey , e.altKey, e.shiftKey);
	var func = AAMShortcutManager._table[key];
	
	if(func){
		func();
	}
}
AAMShortcutManager._createKey = function(char,isCtrl, isAlt, isShift)
{
	var key = new String(char);
	if(isCtrl)
		key += AAMShortcutManager.ctrl;
	if(isAlt)
		key += AAMShortcutManager.alt;
	if(isShift)
		key += AAMShortcutManager.shift;
	return key;
}




/*
---------------------------------
	Geometric classes
---------------------------------
*/
var AAMPositionUtil = function(){};

AAMPositionUtil.isWatchMousePosition = false;

AAMPositionUtil.mouseX;
AAMPositionUtil.mouseY;
AAMPositionUtil.prevMouseX;
AAMPositionUtil.prevMouseY;
AAMPositionUtil.onmousemove;
AAMPositionUtil.watchMousePosition = function(val)
{
	if(val==AAMPositionUtil.isWatchMousePosition)
		return;
		
	if(val==true){
		window.addEventListener("mousemove", AAMPositionUtil._mouseMoveHandler);
	}else{
		window.removeEventListener("mousemove", AAMPositionUtil._mouseMoveHandler);
	}
}

AAMPositionUtil._mouseMoveHandler = function(e)
{
	AAMPositionUtil.prevMouseX = AAMPositionUtil.mouseX;
	AAMPositionUtil.prevMouseY = AAMPositionUtil.mouseY;
	AAMPositionUtil.mouseX = e.clientX;
	AAMPositionUtil.mouseY = e.clientY;
	if(AAMPositionUtil.onmousemove)
		AAMPositionUtil.onmousemove(e);
}


AAMPositionUtil.screenWidth = function()
{
	return window.screen.width;
}
AAMPositionUtil.screenHeight = function()
{
	return window.screen.height;
}

AAMPositionUtil.screenLeft = function()
{
	return window.screen.height;
}

AAMPositionUtil.screenTop = function()
{
	return window.screenX;
}

AAMPositionUtil.documentWidth = function()
{
	return document.width;
}

AAMPositionUtil.documentHeight = function()
{
	return document.height;
}

AAMPositionUtil.setCenter = function(element)
{
}

AAMPositionUtil.setCenterTo = function(element, x, y)
{
}


/*
--------------------------------
	Screen Lock
--------------------------------
*/

var AAMScreenLock = function(){}
AAMScreenLock.element;
AAMScreenLock.backgroundColor = "rgba(240,240,240,0.5)";
AAMScreenLock.init = function(element)
{
	AAMScreenLock.element = element;
	element.style.position = "absolute";
	element.style.top = "0";
	element.style.left = "0";
	element.style.width = document.width;
	element.style.height = document.height;
	element.style.visibility = "hidden";
	window.addEventListener("resize", function(){AAMScreenLock._updateSize();}, false);
}
AAMScreenLock.lock = function()
{
	var el = AAMScreenLock.element;
	el.style.visibility = "visible";
	el.style.backgroundColor = AAMScreenLock.backgroundColor
	AAMScreenLock._updateSize();
}

AAMScreenLock.unlock = function()
{
	AAMScreenLock.element.style.visibility = "hidden";
}

AAMScreenLock._updateSize = function()
{
	var el = AAMScreenLock.element;
	el.style.width = 1;
	el.style.height = 1;
	
	el.style.width = document.width;
	el.style.height = document.height;
}


/*
--------------------------------
	Activity Indicator
	Dependancy: AAMScreenLock
--------------------------------
*/

var AAMActivityIndicator = function(){}
AAMActivityIndicator.element;
AAMActivityIndicator.onstart;
AAMActivityIndicator.onhide;
AAMActivityIndicator.init = function(element)
{
	AAMActivityIndicator.element = element;
	element.style.visibility = "hidden";
	element.style.position = "absolute";
}
AAMActivityIndicator.start = function()
{
	AAMScreenLock.lock();
	
	var el = AAMActivityIndicator.element
	el.style.visibility = "visible";
	AAMActivityIndicator._updatePosition();
	
	window.addEventListener("resize", AAMActivityIndicator._updatePosition, false);
	window.addEventListener("scroll", AAMActivityIndicator._updatePosition, false);
	
	if(this.onstart)
		this.onstart();
}
AAMActivityIndicator.stop = function()
{
	window.removeEventListener("resize", AAMActivityIndicator._updatePosition, false);
	window.removeEventListener("scroll", AAMActivityIndicator._updatePosition, false);
	
	AAMActivityIndicator.element.style.visibility = "hidden";
	AAMScreenLock.unlock();
	if(this.onhide)
		this.onhide();
}
AAMActivityIndicator._updatePosition = function()
{
	var el = AAMActivityIndicator.element;
	var screenW = window.screen.width;
	var screenH = window.screen.height;
	
	var x = window.scrollX + window.innerWidth * 0.5;
	var y = window.scrollY + window.innerHeight * 0.5;
	var w = el.style.width;
	var h = el.style.height;
	
	el.style.left = x - w*0.5;
	el.style.top = y - h*0.5;
}


var AAMTooltip = function(){}
AAMTooltip.element;
AAMTooltip.target;
AAMTooltip.offsetX = 0;
AAMTooltip.offsetY = 2;
AAMTooltip.init = function(element){
	AAMTooltip.element = element;
	element.style.position = "absolute";
	element.style.visibility = "hidden";
	element.style.pointerEvents = "none";
}
AAMTooltip.show = function(target, text){
	var el = AAMTooltip.element;
	if(!el)
		return;
	
	el.innerHTML = text;
	
	var tx = target.offsetLeft;
	var ty = target.offsetTop;
	var tw = target.offsetWidth;
	var th = target.offsetHeight;
	var ew = el.offsetWidth;
	var eh = el.offsetHeight;
	
	el.style.visibility = "visible";
	el.style.left = tx + tw * 0.5 - ew*0.5 + AAMTooltip.offsetX;
	el.style.top = ty - eh + AAMTooltip.offsetY;
}
AAMTooltip.hide = function(){
	var el = AAMTooltip.element;
	if(!el)
		return;
		
	el.style.visibility = "hidden";	
}



/*
---------------------------------
	UI classes
---------------------------------
*/

var AAMButton = function(){}
AAMButton.prototype.element;
AAMButton.prototype.data;
AAMButton.prototype.tooltip;
AAMButton.prototype._selected = false;
AAMButton.prototype.toggle = false;
AAMButton.prototype._state = "up";
AAMButton.prototype._enabled = true;

//EventHandler
AAMButton.prototype.onmousedown
AAMButton.prototype.onchange;
//Skins

AAMButton.defaultUpSkin = "aamButtonUpSkin";
AAMButton.defaultOverSkin = "aamButtonOverSkin";
AAMButton.defaultDownSkin = "aamButtonDownSkin";
AAMButton.defaultDisabledSkin = "aamButtonDisabledSkin";

AAMButton.prototype.baseSkin;
AAMButton.prototype.upSkin;
AAMButton.prototype.overSkin;
AAMButton.prototype.downSkin;
AAMButton.prototype.disabledSkin;
AAMButton.prototype.init = function(element){
	this.element=element
	var ref = this;
	this.element.onmousedown = function(e){ ref._mouseDownHandler(e) }
	this.element.onmouseup = function(e){ ref._mouseUpHandler(e) }
	this.element.onmouseover = function(e){ ref._mouseOverHandler(e) }
	this.element.onmouseout = function(e){ ref._mouseOutHandler(e) }
	this.upSkin = AAMButton.defaultUpSkin;
	this.downSkin = AAMButton.defaultDownSkin;
	this.overSkin = AAMButton.defaultOverSkin;
	this.disabledSkin = AAMButton.defaultDisabledSkin;
	return this;
};

AAMButton.prototype.updateView = function()
{
	var s = this._state;
	var cn = "";
	if((s=="down" || this._selected) && this.downSkin){
		cn = this.downSkin;
	}else if(s=="over" && this.overSkin){
		cn = this.overSkin;
	}else{
		cn = this.upSkin;
	}
	this.element.className = cn;
}

AAMButton.prototype._mouseDownHandler = function(e)
{
	if(!this._enabled)
		return;
		
	this._state = "down";
	this.updateView();
}

AAMButton.prototype._mouseUpHandler = function(e)
{
	if(!this._enabled)
		return;
	if(this._state!="down")
		return;
		
	this._state = "up";
	if(this.toggle){
		this._selected = !this._selected;
		if(this.onchange)
			this.onchange(this);
	}
	if(this.onmousedown){
		this.onmousedown(this);
	}
	this.updateView();
}

AAMButton.prototype._mouseOverHandler = function(e)
{
	if(!this._enabled)
		return;
		
	if(this.tooltip)
		AAMTooltip.show(this.element, this.tooltip);
	
	this._state = "over";
	this.updateView();
}

AAMButton.prototype._mouseOutHandler = function(e)
{
	this._state = "up";
	this.updateView();
	
	AAMTooltip.hide(this.element, this.tooltip);
}

AAMButton.prototype.setEnabled = function(bool)
{
	this._enabled = bool;
	this.updateView();
	return this;
}

AAMButton.prototype.setSelected = function(bool)
{
	this._selected = bool;
	this.updateView();
	return this
}

AAMButton.prototype.setTooltip = function(val)
{
	this.tooltip = val;
	return this
}

/*
---------------------------------
	UI classes
---------------------------------
*/










/*
---------------------------------
	UI classes
---------------------------------
*/


var AAMRadioGroup = function(){}
AAMRadioGroup.prototype._infos;
AAMRadioGroup.prototype._buttons;
AAMRadioGroup.prototype._selectedButton;
AAMRadioGroup.prototype.groupName;
AAMRadioGroup.prototype.onchange;


AAMRadioGroup.prototype.init = function(infos)
{
	this._infos = infos;
	this._buttons = [];
	var ref = this;
	var n = this._infos.length;
	for(var i=0; i<n; i++)
	{
		var info = this._infos[i];
		var element = document.getElementById(info.id);
		var btn = new AAMButton().init(element);
		btn.onmousedown = function(){ ref._downHandler(this);};
		btn.tooltip = info.tooltip;
		this._buttons.push(btn);
	}
}

AAMRadioGroup.prototype.setSelectedIndex = function(index)
{
	this.setSelectedButton(this._buttons[index]);
}

AAMRadioGroup.prototype.setSelectedButton = function(btn)
{
	if(this._selectedButton){
		this._selectedButton.setSelected(false);
	}
	
	this._selectedButton = btn;
	this._selectedButton.setSelected(true);
	if(this.onchange){
		this.onchange(this);
	}
}

AAMRadioGroup.prototype.getButtonIndex = function(btn)
{;
	var n = this._infos.length;
	for(var i=0; i<n; i++){
		if(this._buttons[i]==btn){
			return i;
		}
	}
	return -1;
}

AAMRadioGroup.prototype.getSelectedIndex = function()
{
	return this.getButtonIndex(this._selectedButton);
}

AAMRadioGroup.prototype.getSelectedData = function()
{
	return this._infos[this.getSelectedIndex()].data;
}


//Internal use only
AAMRadioGroup.prototype._downHandler = function(btn)
{
	this.setSelectedButton(btn);
}


/*
------------------------------------------------------
	AAM Color Wheel
------------------------------------------------------
*/

var AAMColorWheel = function(){}
AAMColorWheel.onchange;

AAMColorWheel.prototype._element;
AAMColorWheel.prototype._canvas;
AAMColorWheel.prototype._ctx;
AAMColorWheel.prototype._tempCanvas;
AAMColorWheel.prototype._tempCtx;
AAMColorWheel.prototype._wheelLineWidth = 16;
AAMColorWheel.prototype._pickerRect;
AAMColorWheel.prototype.rgbColor;
//Which are you dragging
AAMColorWheel.prototype._wheelRad = 0;
AAMColorWheel.prototype._rectX = 0;
AAMColorWheel.prototype._rectY = 0;
AAMColorWheel.prototype._mouseX;
AAMColorWheel.prototype._mouseY;
AAMColorWheel.prototype._isMouseDownForWheel = false;
AAMColorWheel.prototype._isMouseDownForRect = false;

AAMColorWheel.prototype.init = function(element, w, h){
	this._element = element;
	
	this._tempCanvas = document.createElement("canvas");
	this._tempCanvas.width = w;
	this._tempCanvas.height = h;
	this._tempCtx = this._tempCanvas.getContext("2d");
	
	this._canvas = document.createElement("canvas");
	this._canvas.width = w;
	this._canvas.height = h;
	this._ctx = this._canvas.getContext("2d");
	element.appendChild(this._canvas);
	this._canvas.oncontextmenu= function(){ return false}
	
	var wh = w*0.5;
	var hh = h*0.5;
	var ctx = this._tempCtx;
	var data = ctx.createImageData(w,h);
	for(var yy=0; yy<h; yy++)
	{
		for(var xx=0; xx<w; xx++)
		{
			var index = (yy*w + xx)*4;
			var rad = Math.atan2(yy-wh,xx-hh);
			var col = AAMColorUtil.hsb2rgb(rad*180/Math.PI+150, 100,100);
			data.data[index] = col.r;
			data.data[index+1] = col.g;
			data.data[index+2] = col.b;
			data.data[index+3] = 255;
		}
	}
	ctx.putImageData(data,0,0);
	
	//Init Inner Rect Info
	w = Math.floor((this._canvas.width-32) / 1.41421356);
	h = w;
	var xoffset = this._canvas.width * 0.5 - w*0.5;
	var yoffset = this._canvas.height*0.5 - h*0.5;
	
	this._pickerRect = new AAMRectangle(xoffset, yoffset, w, h);
	this._rectY = this._pickerRect.height;
	this.rgbColor = new AAMRGBColor(0,0,0);
	
	var ref = this;
	this._canvas.onmousedown = function(e){ ref._downHandler(e) }
	this._updateView();
}

AAMColorWheel.prototype.setRGB = function(r, g, b)
{
	var hsb = AAMColorUtil.rgb2hsb(r,g,b);
	//
	this._wheelRad = this._hue2rad(hsb.h);
	this._rectX = this._sat2x(hsb.s);
	this._rectY = this._bri2y(hsb.b);
	
	this._updateColor();
}

AAMColorWheel.prototype._downHandler = function(e)
{
	var ref = this;
	window.onmouseup = function(e){ ref._upHandler(e) }
	window.onmousemove = function(e){ ref._moveHandler(e) }
	
	var rect = e.target.getBoundingClientRect();
	this._mouseX = (e.clientX - rect.left)
	this._mouseY = (e.clientY - rect.top)
	
	var w = this._canvas.width;
	var h = this._canvas.height;
	var mx = this._mouseX;
	var my = this._mouseY;
	
	var dx = mx - w *0.5;
	var dy = my - h *0.5;
	var dist = Math.sqrt(dx*dx+dy*dy);
	
	if(dist<w  && dist >w*0.5-this._wheelLineWidth){
		//Dragging Wheel
		this._isMouseDownForWheel = true;
		this._calcWheel();
	}else if(this._pickerRect.contains(mx,my)){
		//console.log("rect");
		this._isMouseDownForRect = true;
		this._calcRect();
	}else{
		//Nowhere
	}
}
AAMColorWheel.prototype._upHandler = function(e)
{
	this._isMouseDownForWheel = false;
	this._isMouseDownForRect = false;
	window.onmouseup = undefined;
	window.onmousemove = undefined;
}
AAMColorWheel.prototype._moveHandler = function(e)
{
	var rect = this._canvas.getBoundingClientRect();
	this._mouseX = (e.clientX - rect.left);
	this._mouseY = (e.clientY - rect.top);
	
	if(this._isMouseDownForWheel){
		this._calcWheel();
	}else if(this._isMouseDownForRect){
		this._calcRect();
	}
}

AAMColorWheel.prototype._calcWheel = function(e)
{
	var mx = this._mouseX;
	var my = this._mouseY;
	var w = this._canvas.width;
	var h = this._canvas.height;
	var rad = Math.atan2(my-h*0.5, mx-w*0.5);
	this._wheelRad = rad;
	
	this._updateColor();
}

AAMColorWheel.prototype._calcRect = function(e)
{
	var x = this._mouseX - this._pickerRect.x
	var y = this._mouseY - this._pickerRect.y
	
	var l = 0
	var t = 0
	var r = this._pickerRect.width;
	var b = this._pickerRect.height;
	
	x = Math.max(l,Math.min(r,x));
	y = Math.max(t,Math.min(b,y));
	
	this._rectX = x
	this._rectY = y
	
	this._updateColor();
}

AAMColorWheel.prototype._updateColor = function(e)
{
	var hsb = new AAMHSBColor(0,0,0);
	hsb.h = this._rad2hue(this._wheelRad);
	hsb.s = this._x2sat(this._rectX);
	hsb.b = this._y2bri(this._rectY);
	
	//console.log(hsb.h, hsb.s, hsb.b);
	var newCol = AAMColorUtil.hsb2rgb(hsb.h, hsb.s, hsb.b);
	
	if(this.rgbColor && this.rgbColor.r==newCol.r && this.rgbColor.g==newCol.g && this.rgbColor.b==newCol.b){
		this._updateView();
		return;
	}
	this.rgbColor = newCol;
	this._updateView();
	
	if(this.onchange)
		this.onchange(this);
}


AAMColorWheel.prototype._updateView = function()
{
	this._drawColorWheel();
	this._drawColorRect();
	this._drawWheelPoint();
	this._drawPickerPoint();
	this._drawCrntColor();
}

AAMColorWheel.prototype._drawCrntColor = function()
{
	if(!this.rgbColor)
		return;
		
	var w = this._canvas.width;
	var h = this._canvas.height;
	var ctx = this._ctx;
	ctx.save();
	ctx.fillStyle = "#000000";
	ctx.fillRect(0,h-26,26,26);
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(1,h-25,24,24);
	ctx.fillStyle = this.rgbColor.cssString();
	ctx.fillRect(2,h-24,22,22);
	ctx.restore();
}

AAMColorWheel.prototype._drawColorWheel = function()
{
	var ctx = this._ctx;
	var w = this._canvas.width;
	var h = this._canvas.height;
	var ringLineW = this._wheelLineWidth;
	
	ctx.clearRect(0,0,w,h);
	
	//Draw Color Ring
	ctx.save();
		ctx.beginPath();
		ctx.arc(w*0.5, h*0.5, w*0.5, 0, Math.PI * 2, false);
		ctx.clip()
		ctx.closePath();
		this._ctx.drawImage(this._tempCanvas, 0, 0);
	ctx.restore();
	
	//Draw InnerCircle
	ctx.save();
	ctx.fillStyle = "#ffffff"
	ctx.beginPath();
	ctx.arc(w*0.5, h*0.5, w*0.5-ringLineW, 0, Math.PI * 2, false);
	ctx.fill();
	ctx.restore();
}

AAMColorWheel.prototype._drawColorRect = function(){
	var w = Math.floor((this._canvas.width-32) / 1.41421356);
	var h = w;
	var xoffset = this._canvas.width * 0.5 - w*0.5;
	var yoffset = this._canvas.height*0.5 - h*0.5;
	
	var ctx = this._ctx;
	var imgData = ctx.createImageData(w,h);
	
	var hsb = new AAMHSBColor(100,100,100);
	hsb.h = this._rad2hue( this._wheelRad );
	for(var yy=0; yy<h; yy++)
	{
		for(var xx=0; xx<w; xx++)
		{
			hsb.s = xx/w*100;
			hsb.b = 100-(yy/h*100);
			//console.log(hsb);
			var rgb = AAMColorUtil.hsb2rgb(hsb.h, hsb.s, hsb.b);
			var index = (yy * w + xx)*4;
			imgData.data[index] = rgb.r;
			imgData.data[index+1] = rgb.g;
		 	imgData.data[index+2] = rgb.b;
			imgData.data[index+3] = 255
		}
	}
	ctx.putImageData(imgData,xoffset,yoffset);
}

AAMColorWheel.prototype._drawPickerPoint = function()
{
	this._drawRing(this._rectX + this._pickerRect.x, this._rectY+this._pickerRect.y);
}

AAMColorWheel.prototype._drawWheelPoint = function()
{
	var r = this._canvas.width*0.5;
	var w = this._wheelLineWidth*0.5;
	var x = Math.cos(this._wheelRad)*(r-w) + r;
	var y = Math.sin(this._wheelRad)*(r-w) + r;
	this._drawRing(x,y);
}

AAMColorWheel.prototype._drawRing = function(x,y)
{
	var r = this._canvas.width*0.5;
	
	var ctx = this._canvas.getContext("2d");
	ctx.save();
	var w = this._wheelLineWidth*0.5;
	
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.strokeStyle = "#000000";
	ctx.arc(x+1,y+1,w-1, 0,Math.PI*2, false);
	ctx.closePath();
	ctx.stroke();
	ctx.strokeStyle = "#ffffff";
	ctx.beginPath();
	ctx.arc(x,y,w-1, 0,Math.PI*2, false);
	ctx.closePath();
	ctx.stroke();
	ctx.restore();
}


//convert functions

AAMColorWheel.prototype._rad2hue = function(rad)
{
	return rad * 180 / Math.PI + 150;
}

AAMColorWheel.prototype._hue2rad = function(hue)
{
	var rad = (hue-150)*Math.PI / 180;
	if(rad<0)
		rad += Math.PI*2
	return rad;
}

AAMColorWheel.prototype._x2sat = function(x)
{
	x = Math.max(0, Math.min(this._pickerRect.width, x));
	
	return x / this._pickerRect.width * 100;
}

AAMColorWheel.prototype._sat2x = function(sat)
{
	if(!this._pickerRect)
		return 0;
	
	sat = Math.max(0, Math.min(100, sat));
	var x = sat / 100 * this._pickerRect.width;
	return x;
}

AAMColorWheel.prototype._y2bri = function(y)
{
	y = Math.max(0, Math.min(this._pickerRect.height, y));
	return  100 - y / this._pickerRect.height * 100;
}

AAMColorWheel.prototype._bri2y = function(bri)
{
	if(!this._pickerRect)
		return 0;
		
	bri = Math.max(0, Math.min(100,bri));
	var y= (100-bri) / 100 * this._pickerRect.height;
	return y;
}