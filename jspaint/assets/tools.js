// JavaScript Document
/*
-------------------------------------------------------------------------

	Tool Class
	
-------------------------------------------------------------------------
*/

var ToolBase = function(){};
ToolBase.prototype.startX;
ToolBase.prototype.startY;
ToolBase.prototype.init = function(jspainter){}
ToolBase.prototype.kill = function(jspainter){}
ToolBase.prototype.downHandler = function(jspainter)
{
	this.startX = jspainter.mouseX;
	this.startY = jspainter.mouseY;
};
ToolBase.prototype.upHandler = function(jspainter)
{
};
ToolBase.prototype.moveHandler = function(jspainter)
{
};
ToolBase.prototype.transformForZoom = function(jspainter)
{
	var ctx = jspainter.destCanvasCtx;
	ctx.translate(jspainter.canvasWidth*0.5, jspainter.canvasHeight*0.5);
		ctx.scale(jspainter.zoom, jspainter.zoom);
		ctx.translate(-jspainter.zoomX, -jspainter.zoomY);
}

/*
-------------------------------------------------------------------------
	PEN / ERASER
-------------------------------------------------------------------------
*/


var PenTool = function(){};
PenTool.prototype = new ToolBase();
PenTool.prototype.tool;



PenTool.prototype.init = function(jspainter){
	this.tool = new PenTool2(jspainter);
}


PenTool.prototype.keyDownHandler = function(jspainter)
{
	if(jspainter.isMouseDown || jspainter.isMouseDownRight)
		return;
	this.checkMode(jspainter);
}

PenTool.prototype.keyUpHandler = function(jspainter)
{
	if(jspainter.isMouseDown || jspainter.isMouseDownRight)
		return;
	this.checkMode(jspainter);
}

PenTool.prototype.checkMode = function(jspainter)
{
	var newTool
	if(jspainter.isAltDown){
		newTool = new ColorPickerTool();
	}else{
		newTool = new PenTool2();
	}
	
	if(newTool==this.tool)
		return;
		
	this.tool.kill();
	newTool.init();
	this.tool = newTool;
	
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, false);
	//console.log(this.tool);
}

PenTool.prototype.downHandler = function(jspainter){ this.tool.downHandler(jspainter); };
PenTool.prototype.upHandler = function(jspainter){ this.tool.upHandler(jspainter); };
PenTool.prototype.moveHandler = function(jspainter){ this.tool.moveHandler(jspainter);};
PenTool.prototype.upMoveHandler = function(jspainter){ this.tool.upMoveHandler(jspainter);}
PenTool.prototype.rollOverHandler= function(jspainter){this.tool.rollOverHandler(jspainter);}
PenTool.prototype.rollOutHandler= function(jspainter){this.tool.rollOutHandler(jspainter);}



var PenTool2 = function(){};
PenTool2.prototype = new ToolBase();
PenTool2.prototype.isUpMove = false;
PenTool2.prototype.getColor = function(jspainter)
{
	return jspainter.foregroundColor;
}


PenTool2.prototype.downHandler = function(jspainter)
{
	jspainter.tempCanvasCtx.clearRect(0,0,jspainter.canvasWidth, jspainter.canvasHeight);
	isUpMove = false;
	var ctx = jspainter.tempCanvasCtx;
	ctx.save();
	ctx.lineWidth = jspainter.lineWidth;
	ctx.lineCap = "round";	
	ctx.fillStyle = this.getColor(jspainter);
	jspainter.drawEllipse(ctx,jspainter.mouseX-jspainter.lineWidth*0.5, jspainter.mouseY-jspainter.lineWidth*0.5,jspainter.lineWidth, jspainter.lineWidth, false, true);
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
	ctx.restore();
};


PenTool2.prototype.upHandler = function(jspainter)
{
	//Register undo first;
	jspainter._pushUndo();
	var ctx = jspainter.canvasCtx;
	ctx.globalAlpha = jspainter.alpha;
	ctx.drawImage(jspainter.tempCanvas, 0, 0, jspainter.canvasWidth, jspainter.canvasHeight);
	ctx.globalAlpha = 1.0;
	jspainter.tempCanvasCtx.clearRect(0,0,jspainter.canvasWidth, jspainter.canvasHeight);
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
	this.drawCursor(jspainter);
};


PenTool2.prototype.moveHandler = function(jspainter)
{	
	var ctx = jspainter.tempCanvasCtx;
	ctx.lineWidth = jspainter.lineWidth;
	ctx.lineCap = "round";	
	ctx.strokeStyle = this.getColor(jspainter);
	jspainter.drawLine(ctx, jspainter.mouseX, jspainter.mouseY, jspainter.prevMouseX, jspainter.prevMouseY);
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
};

PenTool2.prototype.drawCursor = function(jspainter)
{
	var mx = jspainter.mouseX;
	var my = jspainter.mouseY;
	var d = jspainter.lineWidth;
	var ctx = jspainter.destCanvasCtx;
	ctx.save();
		this.transformForZoom(jspainter)
		ctx.lineWidth = jspainter.lineWidth;
		ctx.lineCap = "round";	
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = "";
		ctx.lineWidth = 1/jspainter.zoom;
		ctx.globalAlpha = 1;
		jspainter.drawEllipse(ctx, mx+1/jspainter.zoom-d*0.5, my+1/jspainter.zoom-d*0.5, d, d, true, false);
		ctx.strokeStyle = "#ffffff";
		jspainter.drawEllipse(ctx, mx-d*0.5, my-d*0.5, d, d, true, false);
	ctx.restore();
}

PenTool2.prototype.upMoveHandler = function(jspainter)
{
	isUpMove = true;
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
	this.drawCursor(jspainter);
}
PenTool2.prototype.rollOverHandler= function(jspainter){}

PenTool2.prototype.rollOutHandler= function(jspainter)
{
	if(!jspainter.isMouseDown && !jspainter.isMouseDownRight){
		jspainter.tempCanvasCtx.clearRect(0,0,jspainter.canvasWidth, jspainter.canvasHeight);
		jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
	}
}


/*
-------------------------------------------------------------------------
	ERASER extends Pen
-------------------------------------------------------------------------
*/

var EraserTool = function(){};
EraserTool.prototype = new PenTool2();
EraserTool.prototype.getColor = function(jspainter)
{
	return "#ffffff";
}



/*
-------------------------------------------------------------------------
	Color Picker Tool
-------------------------------------------------------------------------
*/

var ColorPickerTool = function(){};
ColorPickerTool.prototype = new ToolBase();
ColorPickerTool.onchange;
ColorPickerTool.prototype.r;
ColorPickerTool.prototype.g;
ColorPickerTool.prototype.b;

ColorPickerTool.cursorData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJZJREFUeNqs09ENgCAMBFBKmIL9Z4MxKlUhUEFo4RI/1Pg4sQIiGm0AoDycnHSmxGoox56CKO4EstWsF9ozK2k12l+ClpvVEAcztIT1Go0aOs2rpetNo2kzKTTECAohmBjjMnTf56tniMd7/wt9mu1ADbYLTUdDAhWs10oKdeeMED7Zon80taJPio+BRnvAi6ib1LkEGADbiJyV5zf+0wAAAABJRU5ErkJggg%3D%3D"
ColorPickerTool.cursorCanvas;
ColorPickerTool.cursorOffsetX;
ColorPickerTool.cursorOffsetY;

ColorPickerTool.prototype.downHandler = function(jspainter)
{
	this._pick(jspainter);
};


ColorPickerTool.prototype.upHandler = function(jspainter)
{
	jspainter.tempCanvasCtx.clearRect(0,0,jspainter.canvasWidth, jspainter.canvasHeight);
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
};


ColorPickerTool.prototype.moveHandler = function(jspainter)
{
	if(jspainter.isMouseDown || jspainter.isMouseDownRight){
		this._pick(jspainter);
	}
};

ColorPickerTool.prototype.upMoveHandler = function(jspainter)
{
	//draw picker image
}

ColorPickerTool.prototype.rollOverHandler= function(jspainter){}

ColorPickerTool.prototype.rollOutHandler= function(jspainter){}

ColorPickerTool.prototype._pick = function(jspainter)
{
	jspainter.tempCanvasCtx.clearRect(0,0,jspainter.canvasWidth, jspainter.canvasHeight);
	
	var x = jspainter.mouseX;
	var y = jspainter.mouseY;
	var cap = jspainter.canvasCtx.getImageData(x,y,1,1);
	this.r = cap.data[0];
	this.g = cap.data[1];
	this.b = cap.data[2];
	
	jspainter.foregroundColor = "rgb(" + this.r + "," + this.g + "," + this.b +")";
	if(ColorPickerTool.onchange)
		ColorPickerTool.onchange(this);
	
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
	this.drawPickerView(jspainter);
	return;
	var ctx = jspainter.tempCanvasCtx;
	ctx.save();
	
	ctx.lineWidth = 32;
	ctx.strokeStyle = "#808080"//jspainter.foregroundColor
	jspainter.drawEllipse(ctx, x-100, y-100, 200, 200, true, false);
	
	ctx.lineWidth = 16;
	ctx.strokeStyle = jspainter.foregroundColor
	jspainter.drawEllipse(ctx, x-100, y-100, 200, 200, true, false);
	
	ctx.restore();
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
}


ColorPickerTool.prototype.drawPickerView = function(jspainter)
{
	var x = jspainter.mouseX;
	var y = jspainter.mouseY;
	var d = 200 / jspainter.zoom;
	
	var ctx = jspainter.destCanvasCtx;
	ctx.save();
		this.transformForZoom(jspainter)
		ctx.globalAlpha = 1;
		
		ctx.strokeStyle = "#808080";
		ctx.lineWidth = 32 / jspainter.zoom;
		jspainter.drawEllipse(ctx, x-d*0.5, y-d*0.5, d, d, true, false);
		
		ctx.strokeStyle = jspainter.foregroundColor
		ctx.lineWidth = 16 / jspainter.zoom;
		jspainter.drawEllipse(ctx, x-d*0.5, y-d*0.5, d, d, true, false);
	ctx.restore();
}


/*
-------------------------------------------------------------------------
	Finger Tool
-------------------------------------------------------------------------
*/

var FingerTool = function(){
	if(!FingerTool.alphaTable){
		this.init();
	}
}
FingerTool.prototype = new ToolBase();
FingerTool.alphaTable;
FingerTool.prototype.tempCanvas;
FingerTool.prototype.init = function(jspainter)
{
	var sizes = [1,2,4,8,16,32,64,128];
	var data = {};
	var n = sizes.length;
	for(var i=0; i<n; i++)
	{
		var size = sizes[i]
		var hs = size*0.5;
		var table = [];
		for(var yy=0; yy<size; yy++){
			for(var xx=0; xx<size; xx++)
			{
				var dx = xx-hs;
				var dy = yy-hs;
				var dist = Math.sqrt(dx*dx+dy*dy);
				table[yy*size+xx] = Math.round((1-dist/hs)*200);
			}
		}
		
		data[size] = table;
	}
	
	FingerTool.alphaTable = data;
}
FingerTool.prototype.downHandler = function(jspainter)
{
	jspainter._pushUndo();
	this.tempCanvas = document.createElement("canvas");
	this.tempCanvas.width = jspainter.lineWidth;
	this.tempCanvas.height = jspainter.lineWidth;
}
FingerTool.prototype.upHandler = function(jspainter)
{
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, false);
}
FingerTool.prototype.moveHandler = function(jspainter)
{
	
	var x = jspainter.mouseX;
	var y = jspainter.mouseY;
	var px = jspainter.prevMouseX;
	var py = jspainter.prevMouseY;
	
	var dx = x - px;
	var dy = y - py;
	var dist = Math.sqrt(dx*dx+dy*dy);
	d = Math.max(Math.abs(dx), Math.abs(dy));
	var xx;
	var yy;
	var pxx = px;
	var pyy = py;
	if(dist>1){// && dist>d*jspainter.lineWidth*0.02){
		n = d;
		for(var i=0; i<n+1; i++)
		{
			var xx = px + dx*i/n;
			var yy = py + dy*i/n;
			this.draw(jspainter, xx,yy,pxx,pyy);
			pxx = xx;
			pyy = yy;
			
		}
	}else{
		this.draw(jspainter, x,y,px,py);
	}
	
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, false);
}

FingerTool.prototype.draw = function(jspainter, x, y, px, py)
{
	var d = jspainter.lineWidth;
	var dhalf = d*0.5;
	
	var tempCtx = this.tempCanvas.getContext("2d");
	
	var xx = px-dhalf;
	var yy = py-dhalf;
	var sx = xx; 
	var sy = yy;
	var sw = d;
	var sh = d;
	var dx = 0; 
	var dy = 0;
	var dw = d;
	var dh = d;
	
	if(xx<0){
		sx = 0;
		sw = dw = d +xx;
		dx = 0 - xx;
	}else if(xx+d > jspainter.canvas.width){
		sw = d - ((xx+d) - jspainter.canvas.width)
		dw = sw;
	}else if(xx > jspainter.canvas.width){
		return
	}
	
	if(yy<0){
		sy = 0;
		sh = dh = d + yy;
		dy = 0 - yy;
	}else if(yy+d > jspainter.canvas.height){
		sh = d - (yy+d - jspainter.canvas.height);
		dh = sh;
	}else if(yy>jspainter.canvas.height){
		return
	}
	
	tempCtx.fillStyle = "#ffffff";
	tempCtx.fillRect(0,0,d,d);
	tempCtx.drawImage(jspainter.canvas, sx, sy, sw, sh, dx, dy, dw, dh);
	var tempData = tempCtx.getImageData(0, 0, d, d);
	
	
	
	var table = FingerTool.alphaTable[d];
	if(!table){
		console.log("Finger Tool.moveHandler, there is no Alpha table for this PenSize");
	}
	
	var n = table.length;
	for(var i=0; i<n; i++)
	{
		tempData.data[i*4+3] = table[i];
	}
	
	
	tempCtx.save();
	tempCtx.putImageData(tempData,0,0);
	tempCtx.restore();
	
	var ctx = jspainter.canvasCtx;
	ctx.save();
	ctx.drawImage(this.tempCanvas,x-dhalf,y-dhalf);
	ctx.restore();
}


/*
-------------------------------------------------------------------------
	AIRBrush
-------------------------------------------------------------------------
*/

var AirBrushTool = function(){};
AirBrushTool.prototype = new ToolBase();
AirBrushTool.prototype.startX;
AirBrushTool.prototype.startY;
AirBrushTool.prototype.intervalID
AirBrushTool.prototype.kill = function()
{
	if(this.intervalID){
		clearInterval(this.intervalID);
		this.intervalID = undefined;
	}
}
AirBrushTool.prototype.downHandler = function(jspainter)
{
	jspainter._pushUndo();
	
	var ref = this;
	if(!this.intervalID)
	this.intervalID = setInterval(function(){ ref.draw(jspainter) }, 50);

};
AirBrushTool.prototype.upHandler = function(jspainter)
{
	if(this.intervalID){
		clearInterval(this.intervalID);
		this.intervalID = undefined;
	}
};
AirBrushTool.prototype.moveHandler = function(jspainter)
{
};


AirBrushTool.prototype.draw = function(jspainter)
{
	try{
		if(jspainter.isMouseDown==false && jspainter.isMouseDownRight == false){
			if(this.intervalID)
				clearInterval(this.intervalID);
			this.intervalID = undefined;
			return;
		}
		
		var x = jspainter.mouseX;
		var y = jspainter.mouseY;
		var w = 10;
		var h = 10;
		for(var i=0; i<5; i++){
		var ctx = jspainter.canvasCtx;
			x = jspainter.mouseX + ((Math.random()+Math.random()+Math.random()+Math.random())/4-0.5)* jspainter.lineWidth * 2;
			y = jspainter.mouseY + ((Math.random()+Math.random()+Math.random()+Math.random())/4-0.5)* jspainter.lineWidth * 2;
			var dx = x - jspainter.mouseX;
			var dy = y - jspainter.mouseY;
			var dist = Math.sqrt(dx*dx+dy*dy);
			if(dist<2)
				dist = 2;
			
			w = h = jspainter.lineWidth * Math.random()*0.5;
			ctx.save();
				ctx.globalAlpha = jspainter.alpha * 0.8;
				ctx.fillStyle = jspainter.foregroundColor;
				jspainter.drawEllipse(ctx, x-w*0.5, y-w*0.5, w, h, false, true);
			ctx.restore();
		}
	}catch(error){
		console.log(error);
	}
	
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, false);
}


/*
-------------------------------------------------------------------------
	PEN / ERASER
-------------------------------------------------------------------------
*/


var ShapeTool = function(){};
ShapeTool.prototype = new ToolBase();
ShapeTool.prototype.upHandler = function(jspainter)
{
	//Register undo first;
	jspainter._pushUndo();
	
	var ctx = jspainter.canvasCtx;
	jspainter.tempCanvasCtx.clearRect(0,0,jspainter.canvasWidth, jspainter.canvasHeight);
	this.draw(ctx, jspainter.alpha);
};
ShapeTool.prototype.moveHandler = function(jspainter)
{
	var ctx = jspainter.tempCanvasCtx;
	ctx.clearRect(0,0,jspainter.canvasWidth, jspainter.canvasHeight);
	this.draw(ctx, 1);
};
ShapeTool.prototype.setupTool = function(jspainter, ctx)
{
	ctx.lineWidth = jspainter.lineWidth;
	ctx.lineCap = "round";	
	ctx.strokeStyle = jspainter.foregroundColor;
	ctx.globalAlpha = jspainter.alpha;
}



var LineTool = function(){ };
LineTool.prototype = new ShapeTool();
LineTool.prototype.draw = function(ctx, alpha)
{
	var mx = jspainter.mouseX;
	var my = jspainter.mouseY;
	ctx.save();
		this.setupTool(jspainter, ctx);
		ctx.globalAlpha = alpha;
		jspainter.drawLine(ctx, this.startX, this.startY, mx, my);
	ctx.restore();
	
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
}



var BoxTool = function(){ };
BoxTool.prototype = new ShapeTool;
BoxTool.prototype.draw = function(ctx, alpha)
{	
	var x = this.startX; 
	var y = this.startY;
	var w = jspainter.mouseX-this.startX; 
	var h = jspainter.mouseY-this.startY;
	if(jspainter.isAltDown){
		x = x - w;
		y = y - h;
		w = w*2;
		h = h*2;
	}

	ctx.save();
		this.setupTool(jspainter, ctx);
		ctx.globalAlpha = alpha;
		jspainter.drawRect(ctx, x, y, w, h, true, false);
	ctx.restore();
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
}


var EllipseTool = function(){ };
EllipseTool.prototype = new ShapeTool;
EllipseTool.prototype.draw = function(ctx, alpha)
{
	var x = this.startX; 
	var y = this.startY;
	var w = jspainter.mouseX-this.startX; 
	var h = jspainter.mouseY-this.startY;
	if(jspainter.isAltDown){
		x = x - w;
		y = y - h;
		w = w*2;
		h = h*2;
	}
	
	ctx.save();
		this.setupTool(jspainter, ctx);
		ctx.globalAlpha = alpha;
		jspainter.drawEllipse(ctx, x, y, w, h, true, false);
	ctx.restore();
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
}



var FillBoxTool = function(){ };
FillBoxTool.prototype = new ShapeTool;
FillBoxTool.prototype.draw = function(ctx, alpha)
{
	var x = this.startX; 
	var y = this.startY;
	var w = jspainter.mouseX-this.startX; 
	var h = jspainter.mouseY-this.startY;
	if(jspainter.isAltDown){
		x = x - w;
		y = y - h;
		w = w*2;
		h = h*2;
	}
	
	ctx.save();
		ctx.lineWidth = jspainter.lineWidth;
		ctx.lineCap = "round";	
		ctx.fillStyle = jspainter.foregroundColor;
		ctx.globalAlpha = alpha;
		jspainter.drawRect(ctx, x, y, w, h, false, true);
	ctx.restore();
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
}



var FillEllipseTool = function(){ };
FillEllipseTool.prototype = new ShapeTool;
FillEllipseTool.prototype.draw = function(ctx, alpha)
{
	var x = this.startX; 
	var y = this.startY;
	var w = jspainter.mouseX-this.startX; 
	var h = jspainter.mouseY-this.startY;
	if(jspainter.isAltDown){
		x = x - w;
		y = y - h;
		w = w*2;
		h = h*2;
	}
	
	ctx.save();
		ctx.lineWidth = jspainter.lineWidth;
		ctx.lineCap = "round";	
		ctx.fillStyle = jspainter.foregroundColor;
		ctx.globalAlpha = alpha;
		jspainter.drawEllipse(ctx, x, y, w, h, false, true);
	ctx.restore();
	jspainter.updateDestCanvas(0,0,jspainter.canvasWidth, jspainter.canvasHeight, true);
}
