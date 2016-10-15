// JavaScript Document

var CommandBase = function(){
};
CommandBase.prototype.data;
CommandBase.prototype.execute = function(){}

/*
---------------------------------------------------
	SAVE
---------------------------------------------------
*/

var QuickSaveCommand = function(data){this.data=data};
QuickSaveCommand.prototype = new CommandBase();
QuickSaveCommand.prototype.execute = function(){
	if(window.confirm(AAMLocalizeUtil.getText("Confirm Save"))){
		AAMActivityIndicator.start();
		var dataStr = this.data.canvas.toDataURL();
		// localStorage.setItem( "quickSave_imageData", dataStr);
		// save 하지 말고 서버로 보내자

		$.ajax({
		  type: "POST",
		  url: "http://localhost:5000/upload",
		  data: {
		     imgBase64: dataStr
		  },
			success: function(o){
				console.log('saved');
			}
		});
		setTimeout(function(){ AAMActivityIndicator.stop(); }, 200);
	}
}

var QuickLoadCommand = function(data, skipConfirm){this.data=data; this.skipConfirm = skipConfirm};
QuickLoadCommand.prototype = new CommandBase();
QuickLoadCommand.prototype.skipConfirm;
QuickLoadCommand.prototype.execute = function(){
	var dataStr = localStorage.getItem("quickSave_imageData");
	if(dataStr){
		if(this.skipConfirm || window.confirm(AAMLocalizeUtil.getText("Confirm Load"))){
			AAMActivityIndicator.start();
			//Register action for Undo
			this.data._pushUndo();
			var img = new Image();
			var ref = this;
			//do rest of process after loading image;
			img.onload = function(){
				ref.data.canvasCtx.drawImage(this,0,0);
				ref.data.updateDestCanvas(0,0,ref.data.canvasWidth, ref.data.canvasHeight, true);
				AAMActivityIndicator.stop();
			}
			img.src = dataStr;
		}
	}else{
		alert("There is no saved data...");
	}
}

var AutoLoadCommand = function(data){this.data=data};
AutoLoadCommand.prototype = new CommandBase();
AutoLoadCommand.prototype.execute = function(){
	var dataStr = localStorage.getItem("quickSave_imageData");
	if(dataStr){
		new QuickLoadCommand(this.data, true).execute();
		return true;
	}
	return false;
}




var TweetCommand = function(data, accessToken){this.data=data; this.accessToken = accessToken};
TweetCommand.prototype = new CommandBase();
TweetCommand.prototype.accessToken = false;
TweetCommand.prototype.execute = function(){

	//First we do auth check
	var msgStr = document.getElementById("input_tweet").value;
	if(msgStr){
		msgStr += " ";
	}else{
		msgStr = "";
	}
	localStorage.setItem( "quickSave_tweetComment", encodeURIComponent(msgStr));

	var ref = this;
	if(this.accessToken==true){
		AAMActivityIndicator.start();
		var dataStr = ref.data.canvas.toDataURL();
		$.ajax({
			type : 'POST',
			url : 'twitpic.php',
			data : 'media=' + encodeURIComponent(dataStr) + '&message=' + encodeURIComponent(msgStr + "by #jspaint http://bit.ly/cexan8 ") + '&tweet=1',
			success : function(dataStr, dataType) {
				var result = eval('(' + dataStr + ')');
				if(result.status) {
					AAMActivityIndicator.stop();
					document.getElementById("input_tweet").value = "";
					localStorage.setItem( "quickSave_tweetComment", "");
					alert(AAMLocalizeUtil.getText("Twitter Post Success"));
					//should unlock screen
					window.open(result.url);
				} else {
					AAMActivityIndicator.stop();
					alert(AAMLocalizeUtil.getText("Twitter Post Failed") + ' [' + result.message + ']');
				}
			},
			error : function(XMLHttpRequest, textStatus, errorThrown){
				 AAMActivityIndicator.stop();
				alert('Failed to upload. Please try it later.');
			}
		});
	}else{
				//Need Auth
		if( window.confirm(AAMLocalizeUtil.getText("Twitter Auth"))){
			window.onbeforeunload = undefined;

			var dataStr = ref.data.canvas.toDataURL();

			localStorage.setItem( "quickSave_imageData", dataStr);
			document.location = "auth.php";
		}else{
			AAMActivityIndicator.stop();
		}
	}
}



/*
---------------------------------------------------
	UNDO
---------------------------------------------------
*/
var UndoCommand = function(data){this.data=data};
UndoCommand.prototype = new CommandBase();
UndoCommand.prototype.execute = function(){
	this.data.undo();
}



/*
---------------------------------------------------
	REDO
---------------------------------------------------
*/
var RedoCommand = function(data){this.data=data};
RedoCommand.prototype = new CommandBase();
RedoCommand.prototype.execute = function(){
	this.data.redo();
}



/*
---------------------------------------------------
	ZOOM
---------------------------------------------------
*/
var ZoomPlusCommand = function(data){this.data=data};
ZoomPlusCommand.prototype = new CommandBase();
ZoomPlusCommand.prototype.execute = function(){
	var val = (this.data.zoom<16)? this.data.zoom*=2 : this.data.zoom;
	this.data.setZoom( val );
}

var ZoomMinusCommand = function(data){this.data=data};
ZoomMinusCommand.prototype = new CommandBase();
ZoomMinusCommand.prototype.execute = function(){
	var val = (this.data.zoom>2)? this.data.zoom*=0.5 : 1;
	this.data.setZoom( val );
}

/*
----------------------------------------------------
	Edit
----------------------------------------------------
*/

var EditCommand = function(){};
EditCommand.prototype = new CommandBase();
EditCommand.prototype.editCanvas = function(){};
EditCommand.prototype.execute = function()
{
	this.data._pushUndo();
	var ctx = this.data.canvasCtx;
	ctx.save();
	this.editCanvas();
	ctx.restore();
	this.data.updateDestCanvas(0,0,this.data.canvasWidth, this.data.canvasHeight, true);
}


var FlipVCommand = function(data){this.data=data};
FlipVCommand.prototype = new EditCommand();
FlipVCommand.prototype.editCanvas = function(){
	var ctx = this.data.canvasCtx;
	ctx.translate(0,this.data.canvasHeight);
	ctx.scale(1,-1);
	ctx.drawImage(this.data.canvas,0,0);
}

var FlipHCommand = function(data){this.data=data};
FlipHCommand.prototype = new EditCommand();
FlipHCommand.prototype.editCanvas = function(){
	var ctx = this.data.canvasCtx;
	ctx.translate(this.data.canvasWidth, 0);
	ctx.scale(-1,1);
	ctx.drawImage(this.data.canvas,0,0);
}


var GetPostCommand = function(data){this.data=data};
GetPostCommand.prototype = new CommandBase();
GetPostCommand.prototype.execute = function()
{
	var ref=this;
	$.ajax({
			type : 'GET',
			url : 'proxy.php',
			dataType: "json",
			data : 'url=' + encodeURIComponent("http://twitpic.com/search/show?q=jspaint&type=recent&page=" + this.data ),
			success : function(dataStr, dataType) {
				ref.createEntries(dataStr);
			},
			error : function(XMLHttpRequest, textStatus, errorThrown){
				console.log("failed to load posts");
			}
	});
}

GetPostCommand.prototype.createEntries = function(data)
{
	var container = document.getElementById("postContaienr");
	var n = data.length;
	for(var i=0; i<n; i++)
	{
		var d = data[i];
		var div = document.createElement("div");
		div.innerHTML = '<a href="' + d.link + '" target="_blank"><img src="' + d.thumb + '"/></a>'
		container.appendChild(div);
	}
}
