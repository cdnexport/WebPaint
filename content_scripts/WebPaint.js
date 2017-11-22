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
		var canvas = document.createElement("canvas");

		var height = window.getComputedStyle(document.getElementsByTagName('body')[0],null).getPropertyValue("Height");
		var heightValue = computePageSize(height);
		var width = window.getComputedStyle(document.getElementsByTagName('body')[0],null).getPropertyValue("Width");
		var widthValue = computePageSize(width);

		canvas.width = widthValue;
		canvas.height = heightValue;
		canvas.id = "WebPaintCanvas";
		canvas.style.border = "1px solid #000000";
		canvas.style.position = "absolute";
		canvas.style.left = "0";
		canvas.style.top = "0";

		document.getElementsByTagName('body')[0].appendChild(canvas);

		oldCanvas = canvas;
		ctx = canvas.getContext("2d");
	}

	//Turns the string into an integer.
	//param property The string of the window size. Ends in "px".
	function computePageSize(property){
		var value = "";
		for (var i = 0; i < property.length-2; i++) {
			value += property[i];
		}
		return parseInt(value);
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
			var mouseX = e.offsetX;
			var mouseY = e.offsetY;

			ctx.lineTo(mouseX,mouseY);
			if(color == "Yellow"){
				ctx.strokeStyle = '#ffff00';
			}
			else if(color == "Red"){
				ctx.strokeStyle = '#ff0000';
			}
			else if(color == "Black"){
				ctx.strokeStyle = '#000000';
			}
			else if(color == "Erase"){
				ctx.clearRect(mouseX,mouseY,3,3);
			}
			if(color != "Erase"){
				ctx.stroke();
			}
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