// JavaScript Document
var f;

var JSPainter = function(){
	this._undoMgr = new UndoManager(10);
};
f = JSPainter;

f.prototype.container;

//UndoManager
f.prototype._undoMgr;

//Current Drawing Tool
f.prototype.tool;


//Canvas Info
f.prototype.canvasWidth;
f.prototype.canvasHeight;
f.prototype.canvas;
f.prototype.canvasCtx;
//Temp Canvas Info
f.prototype.tempCanvas;
f.prototype.tempCanvasCtx;
//Destination Canvas for display
f.prototype.destCanvas;
f.prototype.destCanvasCtx;

//
f.prototype.backgroundColor = "#ffffff";
f.prototype.foregroundColor = "#000000";
f.prototype.uiOutlineColor = "#999999";
f.prototype.lineWidth = 5;
f.prototype.alpha = 0.5;
f.prototype.zoom = 1;
f.prototype.zoomX = 0;
f.prototype.zoomY = 0;

//Mouse Info
f.prototype.isMouseDown;
f.prototype.isMouseDownRight;
f.prototype.prevMouseX;
f.prototype.prevMouseY;
f.prototype.mouseX;
f.prototype.mouseY;

f.prototype.isShiftDown = false;
f.prototype.isCtrlDown = false;
f.prototype.isAltDown = false;

//EventHandler
f.prototype.onUpdateCanvas;



f.prototype.build = function(div, width, height)
{
	this.container = div;
	this._initCanvas(div, width, height);
	
	this.setTool(new PenTool());
}


f.prototype.setTool = function(tool)
{
	if(this.tool && this.tool.kill)
		this.tool.kill();
		
	this.tool = tool;
	tool.init();
}



//initCanvas;
f.prototype._initCanvas = function(div, width, height)
{
	this.canvas = document.createElement("canvas");
	this.canvasWidth = width;
	this.canvasHeight = height;
	this.zoomX = width * 0.5;
	this.zoomY = height * 0.5;
	
	//init destination canvas (for display)
	this.destCanvas = document.createElement("canvas");
	this.destCanvasCtx = this.destCanvas.getContext("2d");
	this.destCanvas.width = width;
	this.destCanvas.height = height;
	this.container.appendChild(this.destCanvas);
	
	//init canvas (actual data)
	this.canvas.width = width;
	this.canvas.height = height;
	this.canvasCtx = this.canvas.getContext("2d");
	this.canvasCtx.fillStyle = this.backgroundColor;
	this.canvasCtx.fillRect(0,0,width,height);
	
	//temp draw canvas (drawing preview)
	this.tempCanvas = document.createElement("canvas");
	this.tempCanvas.width = width;
	this.tempCanvas.height = height;
	this.tempCanvasCtx = this.tempCanvas.getContext("2d");
	this.tempCanvas.style.position = "absolute";
	this.tempCanvas.enabled = false;
	
	
	var ref = this;	//reference for closure
	this.destCanvas.onmousedown = function(e){ ref._mouseDownHandler(e)};
	this.destCanvas.onmousemove = function(e){ ref._mouseMoveHandler(e)};
	this.destCanvas.onmouseup = function(e){ ref._mouseUpHandler(e)};
	this.destCanvas.onmouseover = function(e){ ref._rollOverHandler(e)};
	this.destCanvas.onmouseout = function(e){ ref._rollOutHandler(e)};
	document.onkeydown = function(e){ ref._keyDownHandler(e)};
	document.onkeyup = function(e){ ref._keyUpHandler(e) };
	
	this.updateDestCanvas(0,0,this.canvasWidth,this.canvasHeight);
}





/*
-------------------------------------------------------------------------
	Mouse Event Handling
-------------------------------------------------------------------------
*/

f.prototype._keyDownHandler = function(e)
{
	this.isShiftDown = e.shiftKey;
	this.isCtrlDown = e.ctrlKey;
	this.isAltDown = e.altKey;
	
	if(this.tool.keyDownHandler)
		this.tool.keyDownHandler(jspainter);
}

f.prototype._keyUpHandler = function(e)
{
	this.isShiftDown = e.shiftKey;
	this.isCtrlDown = e.ctrlKey;
	this.isAltDown = e.altKey;
	
	if(this.tool.keyUpHandler)
		this.tool.keyUpHandler(jspainter);
}


f.prototype._rollOverHandler = function(e)
{
	if(this.tool.rollOverHandler){
		this.tool.rollOverHandler(this);
	}
}

f.prototype._rollOutHandler = function(e)
{
	if(this.tool.rollOutHandler){
		this.tool.rollOutHandler(this);
	}
}

f.prototype._mouseDownHandler = function(e)
{
	//Event 0(left) or 2(right)
	if(e.button==2){
		this.isMouseDownRight = true;
	}else{
		this.isMouseDown = true;
	}	
	
	this._updateMousePosition(e);
	this.prevMouseX = this.mouseX;
	this.prevMouseY = this.mouseY;
	this.tool.downHandler(this);
	
	//console.log(e.button);
	
	var ref = this;
	document.onmouseup = function(e){ ref._mouseUpHandler(e)};
}

f.prototype._mouseUpHandler = function(e)
{
	this.isMouseDown = false;
	this.isMouseDownRight = false;
	this.tool.upHandler(this);
	document.onmouseup = undefined;
}

f.prototype._mouseMoveHandler = function(e)
{
	this._updateMousePosition(e);
		
		
	//console.log("test",this.mouseX, this.mouseY, this.prevMouseX, this.prevMouseY);	
	if(this.isMouseDown || this.isMouseDownRight){
		this.tool.moveHandler(this);
	}else{
		if(this.tool.upMoveHandler){
			this.tool.upMoveHandler(this);
		}
	}
	this.prevMouseX = this.mouseX;
	this.prevMouseY = this.mouseY;
}

f.prototype._updateMousePosition = function(e)
{
	var rect = e.target.getBoundingClientRect();
	
	this.mouseX = (e.clientX - rect.left)/this.zoom + this.zoomX  - this.canvasWidth*0.5/this.zoom;
	this.mouseY = (e.clientY - rect.top)/this.zoom + this.zoomY  - this.canvasHeight*0.5/this.zoom;
	
	if(isNaN(this.prevMouseX)){
		this.prevMouseX = this.mouseX;
	}
	if(isNaN(this.prevMouseY)){
		this.prevMosueY = this.mouseY;
	}
}

/*
-------------------------------------------------------------------------
	Undo
-------------------------------------------------------------------------
*/

f.prototype.undo = function()
{
	var undoItem = this._undoMgr.popUndo();
	if(undoItem){
		this._pushRedo();
		this.canvasCtx.putImageData(undoItem.data, undoItem.x,undoItem.y);
		this.updateDestCanvas(undoItem.x, undoItem.y, undoItem.width, undoItem.height);
	}
}

f.prototype.redo = function()
{
	var undoItem = this._undoMgr.popRedo();
	if(undoItem){
		this._pushUndo(0,0,this.canvasWidth, this.canvasHeight, true);
		this.canvasCtx.putImageData(undoItem.data, undoItem.x,undoItem.y);
		this.updateDestCanvas(undoItem.x, undoItem.y, undoItem.width, undoItem.height);
	}
}

f.prototype.hasUndo = function()
{
	return true;
}

f.prototype._pushUndo = function(x, y, w, h, holdRedo)
{
	x = (x==undefined)? 0 : x;
	y = (y==undefined)? 0 : y;
	w = (w==undefined)? this.canvasWidth : w;
	h = (h==undefined)? this.canvasHeight : h;
	var undoItem = new UndoItem();
	undoItem.x = 0;
	undoItem.y = 0;
	undoItem.width = w;
	undoItem.height = h;
	undoItem.data = this.canvasCtx.getImageData(x,y,w,h);
	this._undoMgr.pushUndo(undoItem, holdRedo);
}

f.prototype._pushRedo = function(x, y, w, h)
{
	x = (x==undefined)? 0 : x;
	y = (y==undefined)? 0 : y;
	w = (w==undefined)? this.canvasWidth : w;
	h = (h==undefined)? this.canvasHeight : h;
	var undoItem = new UndoItem();
	undoItem.x = 0;
	undoItem.y = 0;
	undoItem.width = w;
	undoItem.height = h;
	undoItem.data = this.canvasCtx.getImageData(x,y,w,h);
	this._undoMgr.pushRedo(undoItem);
}


/*
-------------------------------------------------------------------------
	Zoom Controller
-------------------------------------------------------------------------
*/

f.prototype.setZoom = function(val){
	this.zoom = val;
	this.updateDestCanvas(0,0,this.canvasWidth,this.canvasHeight,false);
	this.setZoomPosition(this.zoomX, this.zoomY);
}

f.prototype.setZoomPosition = function(x,y){
	var minx = this.canvasWidth/this.zoom*0.5;
	var maxx = this.canvasWidth-minx;
	var miny = this.canvasHeight/this.zoom*0.5;
	var maxy = this.canvasHeight-miny;
	
	x = Math.max(Math.min(maxx,x),minx);
	y = Math.max(Math.min(maxy,y),miny);
	
	//console.log(minx, maxx, miny, maxy, this.zoomX, this.zoomY);
	
	this.zoomX = x;
	this.zoomY = y;
	this.updateDestCanvas(0,0,this.canvasWidth,this.canvasHeight,false);
}


/*
-------------------------------------------------------------------------
	Drawing Helper
-------------------------------------------------------------------------
*/


f.prototype.clearCanvas = function(doConfirm)
{
	if(!doConfirm || window.confirm("Are you sure to CLEAR the canvas?")){
		//Register undo first;
		jspainter._pushUndo();
	
		this.canvasCtx.fillStyle = this.backgroundColor;
		this.drawRect(this.canvasCtx, 0, 0, this.canvasWidth, this.canvasHeight, false, true);
		this.updateDestCanvas(0,0,this.canvasWidth,this.canvasHeight);
	}
}

f.prototype.updateDestCanvas = function(x,y,width,height, useTemp)
{	

	this.destCanvasCtx.save();
	
	this.destCanvasCtx.translate(this.canvasWidth*0.5, this.canvasHeight*0.5);
	this.destCanvasCtx.scale(this.zoom, this.zoom);
	this.destCanvasCtx.translate(-this.zoomX, -this.zoomY);
	this.destCanvasCtx.globalAlpha = 1.0;
	this.destCanvasCtx.fillStyle = "#ffffff";
	this.destCanvasCtx.fillRect(0,0,width,height);
	
	this.destCanvasCtx.drawImage(this.canvas, x, y, width, height, x, y, width, height);
	if(useTemp){
		this.destCanvasCtx.globalAlpha = this.alpha;
		this.destCanvasCtx.drawImage(this.tempCanvas, x,y,width,height, x, y, width, height);
	}
	this.destCanvasCtx.restore();
	
	if(this.onUpdateCanvas)
	{
		this.onUpdateCanvas(this);
	}
}

f.prototype.fillContext = function(color)
{
}

f.prototype.drawLine = function(ctx, x0, y0, x1, y1)
{
	ctx.beginPath();
	ctx.moveTo(x0,y0);
	ctx.lineTo(x1,y1);
	ctx.stroke();
}

f.prototype.drawRect = function(ctx, x, y, w, h, isStroke, isFill)
{
	ctx.beginPath();
	ctx.moveTo(x,y);
	ctx.lineTo(x+w,y);
	ctx.lineTo(x+w,y+h);
	ctx.lineTo(x,y+h);
	ctx.closePath();
	
	if(isFill)
		ctx.fill();
	
	if(isStroke)
		ctx.stroke();
}

f.prototype.drawEllipse = function(ctx, x, y, w, h, isStroke, isFill)
{
	//
	// FOLLOWING CODE IS REFFERENCED FROM, http://webreflection.blogspot.com/2009/01/ellipse-and-circle-for-canvas-2d.html
	// many thanks.
	//
	ctx.beginPath();
	var hB = (w / 2) * .5522848,
        vB = (h / 2) * .5522848,
        eX = x + w,
        eY = y + h,
        mX = x + w / 2,
        mY = y + h / 2;
        ctx.moveTo(x, mY);
        ctx.bezierCurveTo(x, mY - vB, mX - hB, y, mX, y);
        ctx.bezierCurveTo(mX + hB, y, eX, mY - vB, eX, mY);
        ctx.bezierCurveTo(eX, mY + vB, mX + hB, eY, mX, eY);
        ctx.bezierCurveTo(mX - hB, eY, x, mY + vB, x, mY);
        ctx.closePath();
	if(isFill)
		ctx.fill();
	
	if(isStroke)
		ctx.stroke();
}


/*
-------------------------------------------------------------------------

	Data Cache for Undo / Redo
	
-------------------------------------------------------------------------
*/

var UndoManager = function(_maxStep){
	this._maxStep = _maxStep;
	this._undoItems = [];
	this._redoItems = [];
}
UndoManager.prototype._maxStep;
UndoManager.prototype._redoItems;
UndoManager.prototype._undoItems;

//アクションをしてUndo情報を更新
UndoManager.prototype.pushUndo = function(undoItem, holdRedo)
{
	this._undoItems.push(undoItem);
	if(this._undoItems.length > this._maxStep)
	{
		this._undoItems.shift();
	}
	
	if(!holdRedo==true)
		this._redoItems = [];
};

UndoManager.prototype.popUndo = function()
{
	return this._undoItems.pop();
}

UndoManager.prototype.pushRedo = function(undoItem)
{
	this._redoItems.push(undoItem);
}

UndoManager.prototype.popRedo = function()
{
	return this._redoItems.pop();
}


var UndoItem = function(){}
UndoItem.prototype.data;
UndoItem.prototype.x;
UndoItem.prototype.y;
UndoItem.prototype.width;
UndoItem.prototype.height;




/*
-------------------------------------------------------------------------
	Zoom UI
-------------------------------------------------------------------------
*/

var ZoomNavi = function(){
	this.isDrag = false;
	this.dragOffsetX = 0;
	this.dragOffsetY = 0;
};
ZoomNavi.prototype.container;
ZoomNavi.prototype.painter;

ZoomNavi.prototype.canvas;
ZoomNavi.prototype.canvasWidth;
ZoomNavi.prototype.canvasHeight;

ZoomNavi.prototype.prevMouseX;
ZoomNavi.prototype.prevMouseY;
ZoomNavi.prototype.mouseX;
ZoomNavi.prototype.mouseY;

ZoomNavi.prototype.isDrag;

ZoomNavi.prototype.init = function(container, w, h, painter)
{
	this.painter = painter;
	this.container = container;
	this.canvasWidth = w;
	this.canvasHeight = h;
	this.canvas = document.createElement("canvas");
	this.canvas.width = w;
	this.canvas.height = h;
	this.canvas.oncontextmenu= function(){ return false}
	
	var ref = this;
	this.canvas.onmousedown = function(e){ ref.downHandler(e) }
	this.container.appendChild(this.canvas);
}

ZoomNavi.prototype.downHandler = function(e)
{
	this.isDrag = true;
	this._updateMousePosition(e);
	
	this.prevMouseX = this.mouseX;
	this.prevMouseY = this.mouseY;
	
	var ref = this;
	window.onmouseup = function(e){ ref.upHandler(e) }
	window.onmousemove = function(e){ ref.moveHandler(e) }
}

ZoomNavi.prototype.upHandler = function(e)
{
	this.isDrag = false;
	window.onmouseup = undefined;
	window.onmousemove = undefined;
}

ZoomNavi.prototype.moveHandler = function(e)
{
	if(this.isDrag){
		this._updateMousePosition(e);
		
		//Drag Main system here
		var zoomX = this.painter.zoomX;
		var zoomY = this.painter.zoomY;
		var scale = this.canvasWidth / this.painter.canvasWidth;
		
		var dx = (this.mouseX-this.prevMouseX) / scale;
		var dy = (this.mouseY-this.prevMouseY) / scale;
		zoomX += dx;
		zoomY += dy;
		
		this.painter.setZoomPosition(zoomX, zoomY);
		
		this.prevMouseX = this.mouseX;
		this.prevMouseY = this.mouseY;
	}
}

ZoomNavi.prototype._updateMousePosition = function(e)
{
	var rect = e.target.getBoundingClientRect();
	this.mouseX = e.clientX// - rect.left);
	this.mouseY = e.clientY// - rect.top);
}

ZoomNavi.prototype.updateView = function()
{
	var ctx = this.canvas.getContext("2d");
	
	ctx.fillStyle="#ff0000";
	ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight);
	
	ctx.drawImage(this.painter.canvas, 0,0,this.canvasWidth, this.canvasHeight);
	
	//0.3;
	var canvasRatio = this.canvasWidth / this.painter.canvasWidth;
	var scale = 1 / this.painter.zoom;
	
	var x = this.painter.zoomX * canvasRatio;
	var y = this.painter.zoomY * canvasRatio;
	var w = this.canvasWidth * scale;
	var h = this.canvasHeight * scale;
	
	//draw zoomArea
	ctx.save();
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.globalAlpha = 0.5;
		ctx.rect(x-w*0.5+1,y-h*0.5+1,w,h);
		ctx.stroke();
	ctx.restore();
	ctx.save();
		ctx.strokeStyle = "#ffffff";	
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.rect(x-w*0.5,y-h*0.5,w,h);
		ctx.stroke();
	ctx.restore();
}

