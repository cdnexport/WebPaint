(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;


	var canvas;
	var oldCanvas;
	var ctx;
	var mousedown = false;
	var isPaintEnabled = false;
	var color;
	var reset;

	//Places the canvas element on the screen.
	function createCanvas(){
		var w = window,
		    d = document,
		    e = d.documentElement,
		    g = d.getElementsByTagName('body')[0],
		    x = w.innerWidth || e.clientWidth || g.clientWidth,
		    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

		var canvas = document.createElement("canvas");
		canvas.width = x;
		canvas.height = y;
		canvas.id = "WebPaintCanvas";
		canvas.style.border = "1px solid #000000";
		canvas.style.position = "absolute";
		canvas.style.left = "0";
		canvas.style.top = "0";

		document.getElementsByTagName('body')[0].appendChild(canvas);

		oldCanvas = canvas;
		ctx = canvas.getContext("2d");
	}

	//Occurs when a mouse button is pressed
	function mouseDownHandler(e){
		mousedown = true;
	}

	//Occurs when a mouse button is released
	function mouseUpHandler(e){
		mousedown = false;
	}

	//Draws on the canvas element
	function mouseMoveHandler(e){
		if(!mousedown){
			ctx.beginPath();
			ctx.moveTo(mouseX,mouseY);
		}
		if(mousedown){
			var mouseX = e.clientX;
			var mouseY = e.clientY;

			ctx.lineTo(mouseX,mouseY);
			if(color == "Yellow"){
				ctx.strokeStyle = '#ffff00';
			}
			else if(color == "Red"){
				ctx.strokeStyle = '#ff0000';
			}
			else{
				ctx.strokeStyle = '#000000';
			}
			ctx.stroke();
		}
	}

	//Initiates the entire canvas process. 
	function applyCanvas(){
		if(reset){
			document.getElementsByTagName('body')[0].removeChild(document.getElementById("WebPaintCanvas"));
			oldCanvas = null;
			createCanvas();
		}
		else { 
			if(!oldCanvas && !document.getElementById("WebPaintCanvas")){
				createCanvas();
			}
			else{
				document.getElementsByTagName('body')[0].appendChild(oldCanvas);
				ctx = oldCanvas.getContext("2d");
			}
		}
		document.addEventListener("mousedown",mouseDownHandler);
		document.addEventListener("mousemove",mouseMoveHandler);
		document.addEventListener("mouseup",mouseUpHandler);
	}

	//Removes the old canvas from the screen
	function disablePaint(){
		document.removeEventListener("mousedown",mouseDownHandler);
		document.removeEventListener("mousemove",mouseMoveHandler);
		document.removeEventListener("mouseup",mouseUpHandler);
		var cvs = document.getElementById('WebPaintCanvas');
		oldCanvas = document.getElementsByTagName('body')[0].removeChild(cvs);
	}

	//Handles the message from the popup script.
	//"message":"Enable"/"Disable"
	//"color":"Yellow"/"Red"/"Black"
	//"reset":true/false
	function listener(mail){
		if(mail.message == "Enable"){
			isPaintEnabled = true;
			color = mail.color;
			reset = mail.reset;
			applyCanvas();
		}
		else{
			isPaintEnabled = false;
			disablePaint();
		}
	}

	//Adds the message listener.
	browser.runtime.onMessage.addListener(listener);

})();