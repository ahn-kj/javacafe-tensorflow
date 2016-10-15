<?php require_once('common.php');?>
<html> 

<head> 
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> 
    
<link rel="stylesheet" type="text/css" media="all" href="styles.css" />
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js" type="text/javascript"></script>
    <script language="javascript" src="assets/AAMUtils.js"></script>
    <script language="javascript" src="assets/AAMInterface.js"></script>
	<script language="javascript" src="assets/jspainter.js"></script>
    <script language="javascript" src="assets/tools.js"></script>
    <script language="javascript" src="assets/commands.js"></script>
    <script>
		var jspainter;
		var zoomNavi;
		var colorWheel;
		var toolRadio;
		var alphaRadio;
		var sizeRadio;
		var colorRatio;
		

		<?php	
		if(isset($_SESSION['twitterAccessToken'])) {
			$token = unserialize($_SESSION['twitterAccessToken']);
			echo 'var twitterAccessToken = true';
		} else {
			echo 'var twitterAccessToken = false';
		}
		?>
	
		function init()
		{
			initLocalization();
			
			/*
			-----------------------------------------------------------------------
			ブラウザ対応チェック
			-----------------------------------------------------------------------
			*/
			var canv = document.createElement("canvas");
			if(!canv.getContext || !canv.toDataURL || !canv.getContext("2d").createImageData){
				alert(lu.getText("No Canvas"));
				return;
			}
			
			
			/*
			-----------------------------------------------------------------------
			初期化
			jspaint本体と各ツールのバインド
			-----------------------------------------------------------------------
			*/
			
			initComponents();
			initButtons();
			
			var msg = decodeURIComponent(localStorage.getItem("quickSave_tweetComment"));
			if(msg && msg != "null"){
				document.getElementById("input_tweet").value = msg;
			}
			
			updateCanvasHandler(undefined);
			if ( localStorage.getItem("quickSave_imageData") ){
				new QuickLoadCommand(jspainter,true).execute();
			}
			
			
			
		}
		
		
		/*
		-----------------------------------------------------------------------
		言語設定
		-----------------------------------------------------------------------
		*/
		function initLocalization()
		{
			var lu = AAMLocalizeUtil;
			lu.addText("Pen", {ja:"ペン", en:"Pen"});
			lu.addText("Eraser", {ja:"消しゴム", en:"Eraser"})
			lu.addText("Picker", {ja:"スポイト", en:"Color Picker"})
			lu.addText("Finger", {ja:"指先 Win Firefoxで障害報告あり", en:"Finger"})
			lu.addText("Air Brush", {ja:"散布ブラシ", en:"Air Brush"})
			lu.addText("Line", {ja:"直線", en:"Line"})
			lu.addText("Box", {ja:"四角", en:"Box"})
			lu.addText("Filled Box", {ja:"四角 (塗り)", en:"Filled Box"})
			lu.addText("Ellipse", {ja:"楕円", en:"Ellipse"})
			lu.addText("Filled Ellipse", {ja:"楕円 (塗り)", en:"Filled Ellipse"})
			lu.addText("Vertical Flip", {ja:"上下反転", en:"Vertical Flip"})
			lu.addText("Horizontal Flip", {ja:"左右反転", en:"Horizontal Flip"})
			lu.addText("Undo", {ja:"取り消し (Ctrl+Z)", en:"Undo"})
			lu.addText("Redo", {ja:"やり直し (Ctrl+SHIFT+Z)", en:"Redo"})
			lu.addText("Confirm Save", {ja:"この絵を記録しますか？　記録した絵はLoadで呼び出せませす。", en:"Are you sure to SAVE this image?"})
			lu.addText("Confirm Load", {ja:"現在の絵を破棄し、最後に記録した絵を読み込みますか？", en:"Are you sure to LOAD image?"})
			lu.addText("Confirm New", {ja:"新しくやり直しますか？", en:"Are you sure to clear the image?"})
			lu.addText("Twitter Post Success", {ja:"Twitterへの投稿に成功しました。", en:"Your image is uploaded to twitter."})
			lu.addText("Twitter Post Failed", {ja:"Twitterへの投稿に失敗しました。少し時間をおいてからもう一度お試し下さい。", en:"Failed to upload. Please try it later."})
			lu.addText("Twitter Auth", {ja:"投稿機能を有効にするには、認証の為に一度Twitter.comに移動する必要があります。認証後にもう一度TweetImaボタンを押してください。絵を保存してページを移動しますか？", en:"You need to move to Twitter.com for login first.\nDo you want to save this image?"});
			lu.addText("No Canvas", {ja:"このアプリはお使いのブラウザではご利用できません。最新のChrome, Firefox, Safariにてお試しください。", en:"JSPaint does not support this browser. Please try with Chrome, FireFox or Safari."});
			lu.addText("Page Leave", {ja:"ページから移動しますか？ 画像をSaveしていない場合データは失われます。", en:"Are you sure to move the page? If you don't save the image, it will be lost."})	
		}
		
		
		/*
		-----------------------------------------------------------------------
		コンポーネントの初期化
		-----------------------------------------------------------------------
		*/
		function initComponents()
		{
			//JSPintの初期化
			jspainter = new JSPainter();
			jspainter.onUpdateCanvas = updateCanvasHandler;
			jspainter.build(document.getElementById("jspContainer"), 640, 480);
			document.getElementById("jspContainer").oncontextmenu= function(){ return false}
			
			//ページ移動するときの確認
			window.onbeforeunload = function(event){return event.returnValue= lu.getText("Page Leave")}
			
			//各種プラグイン、コンポーネントの初期化とバインド
			//画面ロック
			AAMScreenLock.init(document.getElementById("screenLock"));
			//スピナー
			AAMActivityIndicator.init(document.getElementById("activityIndicator"));
			//ツールチップ
			AAMTooltip.init(document.getElementById("tooltip"));
			//ショートカット
			AAMShortcutManager.init();
			//カラーピッカー
			ColorPickerTool.onchange = updatePickerTool;			
			colorWheel = new AAMColorWheel();
			colorWheel.init(document.getElementById("colorWheelContainer"), 208, 208);
			colorWheel.onchange = updateColorWheelHandler;
			//ズーム
			zoomNavi = new ZoomNavi();
			zoomNavi.init(document.getElementById("zoomContainer"),206,154, jspainter);
		}
		
		/*
		-----------------------------------------------------------------------
		ボタンへの機能の割当
		-----------------------------------------------------------------------
		*/
		function initButtons()
		{
			var lu = AAMLocalizeUtil;
			
			//File
			new AAMButton().init(document.getElementById("btn_new")).onmousedown = function(){ jspainter.clearCanvas(true);};
			AAMShortcutManager.addShortcut(78, true, false, false, function(){ jspainter.clearCanvas(true)}); //n
			new AAMButton().init(document.getElementById("btn_load")).onmousedown = function(){ new QuickLoadCommand(jspainter).execute()}
			AAMShortcutManager.addShortcut(79, true, false, false, function(){ new QuickLoadCommand(jspainter).execute()}); //o
			new AAMButton().init(document.getElementById("btn_save")).onmousedown = function(){ new QuickSaveCommand(jspainter).execute()}
			AAMShortcutManager.addShortcut(83, true, false, false, function(){ new QuickSaveCommand(jspainter).execute()}); //s
			new AAMButton().init(document.getElementById("btn_tweet")).onmousedown = function(){ new TweetCommand(jspainter, twitterAccessToken).execute()}
			//Undo
			new AAMButton().init(document.getElementById("btn_undo")).onmousedown = function(){ new UndoCommand(jspainter).execute() };
			AAMShortcutManager.addShortcut(90, true, false, false, function(){ new UndoCommand(jspainter).execute() }); //z
			new AAMButton().init(document.getElementById("btn_redo")).onmousedown = function(){ new RedoCommand(jspainter).execute() };
			AAMShortcutManager.addShortcut(90, true, false, true, function(){ new RedoCommand(jspainter).execute() });	//z
			
			//Zooms
			new AAMButton().init(document.getElementById("btn_zoom_plus")).onmousedown = function(){ new ZoomPlusCommand(jspainter).execute()}
			new AAMButton().init(document.getElementById("btn_zoom_minus")).onmousedown = function(){ new ZoomMinusCommand(jspainter).execute()}
			//Flips
			new AAMButton().init(document.getElementById("btn_flip_v")).setTooltip(lu.getText("Vertical Flip")).onmousedown = function(){ new FlipVCommand(jspainter).execute()}
			new AAMButton().init(document.getElementById("btn_flip_h")).setTooltip(lu.getText("Horizontal Flip")).onmousedown = function(){ new FlipHCommand(jspainter).execute()}
			new AAMButton().init(document.getElementById("btn_undo2")).setTooltip(lu.getText("Undo")).onmousedown = function(){ new UndoCommand(jspainter).execute()}
			new AAMButton().init(document.getElementById("btn_redo2")).setTooltip(lu.getText("Redo")).onmousedown = function(){ new RedoCommand(jspainter).execute()}
			
			//Tool Buttons Setting
			//console.log(new String("z").charCodeAt(0));
			var data = [];
			data.push({id:"btn_tool_pen", data:PenTool, tooltip: lu.getText("Pen")});
			data.push({id:"btn_tool_eraser", data:EraserTool, tooltip: lu.getText("Eraser")});
			data.push({id:"btn_tool_picker", data:ColorPickerTool, tooltip: lu.getText("Picker")});
			data.push({id:"btn_tool_airbrush", data:AirBrushTool, tooltip: lu.getText("Air Brush")});
			data.push({id:"btn_tool_finger", data:FingerTool, tooltip: lu.getText("Finger")});
			data.push({id:"btn_tool_line", data:LineTool, tooltip: lu.getText("Line")});
			data.push({id:"btn_tool_box", data:BoxTool, tooltip: lu.getText("Box")});
			data.push({id:"btn_tool_fillbox", data:FillBoxTool, tooltip: lu.getText("Filled Box")});
			data.push({id:"btn_tool_ellipse", data:EllipseTool, tooltip: lu.getText("Ellipse")});
			data.push({id:"btn_tool_fillellipse", data:FillEllipseTool, tooltip: lu.getText("Filled Ellipse")});
			toolRadio = new AAMRadioGroup();
			toolRadio.onchange = function(){ var toolClass = this.getSelectedData() ; jspainter.setTool(new toolClass()); };
			toolRadio.init(data);
			toolRadio.setSelectedIndex(0);
			
			//Size Buttons Setting
			data = [];
			data.push({id:"btn_size_0", data:1, tooltip:"1px"});
			data.push({id:"btn_size_1", data:2, tooltip:"2px"});
			data.push({id:"btn_size_2", data:4, tooltip:"4px"});
			data.push({id:"btn_size_3", data:8, tooltip:"8px"});
			data.push({id:"btn_size_4", data:16, tooltip:"16px"});
			data.push({id:"btn_size_5", data:32, tooltip:"32px"});
			data.push({id:"btn_size_6", data:64, tooltip:"64px"});
			data.push({id:"btn_size_7", data:128, tooltip:"128px"});
			sizeRadio = new AAMRadioGroup();
			sizeRadio.onchange = function(){ jspainter.lineWidth = this.getSelectedData();}
			sizeRadio.init(data);
			sizeRadio.setSelectedIndex(4);
			
			//Alpha Buttons Setting
			data = [];
			data.push({id:"btn_alpha_5", data:0.05, tooltip:"5%"});
			data.push({id:"btn_alpha_10", data:0.1, tooltip:"10%"});
			data.push({id:"btn_alpha_20", data:0.2, tooltip:"20%"});
			data.push({id:"btn_alpha_40", data:0.4, tooltip:"40%"});
			data.push({id:"btn_alpha_60", data:0.6, tooltip:"60%"});
			data.push({id:"btn_alpha_80", data:0.8, tooltip:"80%"});
			data.push({id:"btn_alpha_100",data:1.0, tooltip:"100%"});
			alphaRadio = new AAMRadioGroup();
			alphaRadio.onchange = function(){ jspainter.alpha = this.getSelectedData();}
			alphaRadio.init(data);
			alphaRadio.setSelectedIndex(6);	
			
			//Colors
			var colors = [	"#000000","#111111","#222222","#333333","#444444","#555555","#666666","#777777","#888888","#999999","#aaaaaa","#bbbbbb","#cccccc","#dddddd","#eeeeee","#ffffff", 
							"#ff0000","#ff5e00","#ffbf00","#e1ff00","#80ff00","#22ff00","#00ff40","#00ff9d","#00ffff","#00a1ff","#0040ff","#1e00ff","#8000ff","#dd00ff","#ff00bf","#ff0062",
							"#ff8080","#ffb080","#ffdf80","#f0ff80","#bfff80","#90ff80","#80ff9f","#80ffce","#80ffff","#80d0ff","#809fff","#8e80ff","#bf80ff","#ee80ff","#ff80df","#ff80b2",
							"#800000","#802f00","#806000","#718000","#408000","#118000","#008020","#00804f","#008080","#005380","#002080","#0f0080","#400080","#6f0080","#800060","#800031"];
			data = [];
			var container = document.getElementById("colorContainer");
			for(var i=0; i<colors.length; i++){
				var d = document.createElement("div");
				d.id = "btn_color_"+i;
				d.style.backgroundImage = getColorButtonSkin(colors[i], i);
				d.style.width = 13;
				d.style.height = 13;
				d.style.marginRight = "0"
				d.style.marginBottom = "0";
				d.style.cssFloat = "left";
				container.appendChild(d);
				data.push({id:d.id, data:colors[i]});
			}
			alphaRadio = new AAMRadioGroup();
			alphaRadio.onchange = function(){ 
				var col = new AAMRGBColor(0,0,0).setCssString(this.getSelectedData());
				colorWheel.setRGB(col.r, col.g, col.b);
			}
			alphaRadio.init(data);
			alphaRadio.setSelectedIndex(1);	
		}
		
		
		
		function updateColorWheelHandler(sender)
		{
			
			var rgb = sender.rgbColor;
			jspainter.foregroundColor = rgb.cssString();
		}
		
		//called when painting canvas is updated
		function updateCanvasHandler(sender)
		{
			if(zoomNavi){
				zoomNavi.updateView();
			}
		}
		
		function updatePickerTool(sender)
		{
			//console.log(sender.r, sender.g, sender.b);
			colorWheel.setRGB(sender.r, sender.g, sender.b);
		}
		
		function getColorButtonSkin(col, i)
		{
			var id = "btn_color_bg_" + i;
			var c = document.createElement("canvas");
			c.width = 13;
			c.height = 13;
			var ctx = c.getContext("2d");
			ctx.fillStyle = col;
			for(var i=0; i<3; i++)
			{
				var offset = 13*i;
				ctx.fillStyle = "#000000"
				ctx.fillRect(offset,0,13,13);
				ctx.fillStyle = col;
				ctx.fillRect(offset+1,1,12,12);
			}	
			return "url("+c.toDataURL()+")";
		}
    </script>
<title>JSPaint runs except IE</title>
<style type="text/css">
</style>
</head>
<body onLoad="init()">
<div id="container">
	<div id="headerContainer">
    	<div id="btn_new"></div>
        <div id="btn_load"></div>
        <div id="btn_save"></div>
        <div id="btn_undo"></div>
        <div id="btn_redo"></div>
    </div>
    <div id="mainContainer">
		<div id="jspContainer"></div>
        <div>
      		<div id="zoomNaviContainer">
                <div id="zoomContainer"></div>
                <div id="plusminusContainer">
                <div id="btn_zoom_minus"></div>
                <div id="btn_zoom_plus"></div>
                </div>
            </div>
           <div id="colorWheelContainer"></div>
           <div id="colorContainer"></div>
        </div>
   </div>
   <div>
   	<div>
        <div id="toolContainer">
            <div class="buttonSet">
                <div id="btn_tool_pen"></div>
                <div id="btn_tool_eraser"></div>
                <div id="btn_tool_picker"></div>
                <div id="btn_tool_finger"></div>
                <div id="btn_tool_airbrush"></div>
                <div id="btn_tool_line"></div>
                <div id="btn_tool_box"></div>
                <div id="btn_tool_fillbox"></div>
                <div id="btn_tool_ellipse"></div>
                <div id="btn_tool_fillellipse"></div>
                <div id="btn_flip_h"></div>
                <div id="btn_flip_v"></div>
                <div id="btn_undo2"></div>
                <div id="btn_redo2"></div>
           </div>
        </div>
    
        <div id="penSettingContainer">
            <div class="buttonSet">
                <div id="btn_size_0"></div>
                <div id="btn_size_1"></div>
                <div id="btn_size_2"></div>
                <div id="btn_size_3"></div>
                <div id="btn_size_4"></div>
                <div id="btn_size_5"></div>
                <div id="btn_size_6"></div>
                <div id="btn_size_7"></div>
                <div id="btn_alpha_5"></div>
                <div id="btn_alpha_10"></div>
                <div id="btn_alpha_20"></div>
                <div id="btn_alpha_40"></div>
                <div id="btn_alpha_60"></div>
                <div id="btn_alpha_80"></div>
                <div id="btn_alpha_100"></div>
            </div>
   	 	</div>
        <div id="tweetContainer">
        	<input id="input_tweet" type="text" maxlength="100"/>
        	<div id="btn_tweet"></div>
            
        </div>
        <div id="followMe">事故防止用にページ移動前に確認がでるようになりました。ペンツール時にAlt+クリックでスポイトを追加。ご意見要望バグ報告は、<a href="http://twitter.com/fladdict">twitter.com/fladdict</a> までお気軽に</div>
    </div>
</div>
<div id="screenLock"></div>
<div id="activityIndicator"></div>
<div id="tooltip"></div>
<!--
<div id="TwitterPostForm">
	<input type="text" maxlength="100"/>
    <input type="submit"/>
</div>-->
</body>
</html>