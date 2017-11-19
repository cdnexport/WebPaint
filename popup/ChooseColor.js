//tabs: A collection that has the tab ids
function listenForClicks(tabs) {
	var isPaintEnabled;
	var tab = tabs[0].id;
	var color;
	var reset = false;

	restoreOptions();

	document.getElementById("yes").addEventListener("click",enablePaint);
	document.getElementById("no").addEventListener("click",enablePaint);

	document.getElementById("yellow").addEventListener("click",selectColor);
	document.getElementById("red").addEventListener("click",selectColor);
	document.getElementById("black").addEventListener("click",selectColor);

	document.getElementById("resetbutton").addEventListener("click",()=>{
		reset=true;
		enablePaint()
	});

	function selectColor(){
		if(document.getElementById("yellow").checked){
			color = "Yellow";
		}
		else if(document.getElementById("red").checked){
			color = "Red";
		}
		else{
			color = "Black";
		}
		enablePaint();
	}

	function enablePaint(){
		var yes = document.getElementById("yes");
		var message;
		if(yes.checked){
			message = "Enable";
			isPaintEnabled = true;
		}
		else{
			message = "Disable";
			isPaintEnabled = false;
		}
		saveOptions();
		browser.tabs.sendMessage(tab, {
			"message": message,
			"color": color,
			"reset": reset
		});
		reset = false;
	}

	function saveOptions(){
		browser.storage.local.set({
			PaintEnabled: isPaintEnabled,
			color: color
		});
	}

	function restoreOptions(){
		browser.storage.local.get('PaintEnabled').then(item=>{
			if(item.PaintEnabled){
				document.getElementById("yes").checked = true;
			}
			else{
				document.getElementById("no").checked = true;
			}
		});

		browser.storage.local.get('color').then(item=>{
			if(item.color == "Yellow"){
				document.getElementById("yellow").checked = true;
				color = "Yellow";
			}
			else if(item.color == "Red"){
				document.getElementById("red").checked = true;
				color = "Red";
			}
			else{
				document.getElementById("black").checked = true;
				color = "Black";
			}
		});
	}
}

//Catches errors that appear.
function reportExecuteScriptError(error) {
  	console.error(`Failed to execute WebPaint script: ${error.message}`);
}

//Gets the tab id of the active tab and then passes it to listenForClicks()
function getActiveTab(){
	browser.tabs.query({active: true, currentWindow: true}).then(listenForClicks);
}

//Injects a script. Then gets the active tab id for the active tab.
browser.tabs.executeScript({file: "/content_scripts/WebPaint.js"})
.then(getActiveTab)
.catch(reportExecuteScriptError);