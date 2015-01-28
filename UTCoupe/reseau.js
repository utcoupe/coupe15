/* --------- Prints ------------- */
function addDiv (parentId, currentId, type, color, name, ip) {
	// possible colors : error, green, yellow, transparent or normal (just "" )

	var newDiv = document.createElement('div');

	var more = "";
	if (parentId == "2B1") 
		more = " webclient";
	else if (parentId == "2B3") 
		more = " client";
	more += " " + color;
	
	newDiv.id    = currentId;
	newDiv.title = "ID de l'appareil : " + currentId;
	newDiv.setAttribute('class', "thing device" + type + more);

	newDiv.innerHTML = "<h3>" + name + "</h3>";
	if(color == "error")
		newDiv.innerHTML += "<br>Impossible de se connecter !";

	document.getElementById(parentId).appendChild(newDiv);
}

function printNotConnected () {
	var blocstoBeCentered = document.querySelectorAll(".toBeCentered");

	for(var i=0; i < blocstoBeCentered.length; i++) {
		var current = blocstoBeCentered[i];
		current.innerHTML = "";
	}

	addDiv("2B1", "owner", "smartphone", "", "Toi", "127.0.0.1");
	addDiv("2B2", "server", "server", "error", "Serveur", "?");
}



/* --------- Layout ------------- */

function resizeWC () {
	var divs = document.querySelectorAll(".webclient");
	// console.log(divs);
	if (divs.length > 0) {
		var firstDiv = window.getComputedStyle(divs[0]);

		if ((parseFloat(firstDiv.height.replace("px", "")) + parseFloat(firstDiv.marginTop.replace("px", ""))) * divs.length > window.getComputedStyle(document.getElementById("webclients")).height.replace("px", "")) {
			// if there's too many divs in the column, they're reduced

			for(var i=0; i < divs.length; i++) {
				divs[i].style.minHeight = "0px";
				divs[i].style.height = 90/divs.length + "%";
				divs[i].style.marginTop = 10/divs.length + "%";
			}
		};
	};
}

function centerBlocs () {
	// Centers divs "toBeCentered" verticaly
	var blocstoBeCentered = document.querySelectorAll(".toBeCentered");

	for(var i=0; i < blocstoBeCentered.length; i++) {
		var current = blocstoBeCentered[i];
		currentSize = window.getComputedStyle(document.getElementById(current.id)).height.replace("px", "");
		parentSize = window.getComputedStyle(document.getElementById(current.parentElement.id)).height.replace("px", "");
		current.style.marginTop = (parentSize - currentSize) / 2;
	}
}

function updateLayout (status) {
	clearColumns();

	if (status.server != null){
		// Adds divs

		addDiv("2B2", "server", "server", "", "Serveur", status.server.ip);
		console.log("nb Webclients :" + status.webclient.length);

		for(var i in status.webclient) {
			var client = status.webclient[i];
			addDiv("2B1", client.key, "smartphone", "", client.ip, client.ip);
		}


		for(var i in status.client) {
			var client = status.client[i];
			addDiv("2B3", client.key, "smartphone", "", client.ip, client.ip);
		}

		resizeWC();
		centerBlocs();

		updateArrows();
	} else {
		printNotConnected();

		resizeWC();
		centerBlocs();
	}
}

function clearColumns () {
	document.getElementById("2B1").innerHTML = "";
	document.getElementById("2B2").innerHTML = "";
	document.getElementById("2B3").innerHTML = "";
}





/* --------- Links ------------- */

function linkDivs (div1Id, div2Id, colId) {
	middleDiv1 = document.getElementById(div1Id).offsetTop + window.getComputedStyle(document.getElementById(div1Id)).height.replace("px", "")/2;
	middleDiv2 = document.getElementById(div2Id).offsetTop + window.getComputedStyle(document.getElementById(div2Id)).height.replace("px", "")/2;
	widthCol = window.getComputedStyle(document.getElementById(colId)).width.replace("px", "");
	document.getElementById(colId).innerHTML += "<path d='M0," + middleDiv1 + " L" + widthCol + "," + middleDiv2 + "' style='stroke:lightblue; stroke-width: 1.25px; fill: none;'/>";	
};

function clearArrows () {
	document.getElementById("arrows1").innerHTML = "";
	document.getElementById("arrows2").innerHTML = "";
	document.getElementById("arrows3").innerHTML = "";
}

function updateArrows (){
	clearArrows();

	for (var i = 0; i < document.querySelectorAll(".webclient").length; i++) {
		var source = document.querySelectorAll(".webclient")[i].id;
		linkDivs(source, "server", "arrows1");
	};

	for (var i = 0; i < document.querySelectorAll(".client").length; i++) {
		var target = document.querySelectorAll(".client")[i].id;
		linkDivs("server", target, "arrows2");
	};

	// penser à ajouter les créations de links avec les I/O
}

/* --------- Events ------------- */

document.getElementById("updateGetClients").addEventListener('click', function (e){
	// penser à virer le JSON parse !!
	updateLayout(JSON.parse(document.querySelector("textarea#getClients").value));
}, true);

window.onresize = function () {
	updateLayout(document.querySelector("textarea#getClients").value || defaultStatus);
}


/* --------- "Main" ------------- */
var defaultStatus = { server: {},  webclient: {}, ia: {},  simulator: {},  client: {} }

updateLayout(defaultStatus);