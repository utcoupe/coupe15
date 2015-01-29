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
	else if(type == "server")
		newDiv.innerHTML += "<br>"+ip;

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
	// ATTENTION !!  Cette fonction fonctionne mal !
	var divs = document.querySelectorAll(".webclient");
	// console.log(divs);
	if (divs.length > 0) {
		var firstDiv = window.getComputedStyle(divs[0]);

		if ((parseFloat(firstDiv.height.replace("px", "")) + parseFloat(firstDiv.marginTop.replace("px", ""))) * divs.length > window.getComputedStyle(document.getElementById("webclients")).height.replace("px", "")) {
			// if there's too many divs in the column, they're reduced

			var parentHeight = window.getComputedStyle(document.getElementById("webclients")).height.replace("px", "");
			var height =  900/divs.length + "%";
			var margin =  10/divs.length + "%";
			// var height = parentHeight * 0.9/divs.length + "px";
			// var margin = parentHeight * 0.1/divs.length + "px";

			console.log("Les divs WC ont été redimensionnés à " + height + " ou 90/" + divs.length + " de " + parentHeight + " avec un intervalle de "+ margin);
			console.log(divs);
			for(var i=0; i < divs.length; i++) {
				divs[i].style.minHeight = "0px";
				divs[i].style.height = height;
				divs[i].style.marginTop = margin;
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

		addDiv("2B2", "simu", "simu", "", "Simulateur", "");
		addDiv("2B2", "server", "server", "", "Serveur", status.server.ip);
		// console.log("nb Webclients :" + status.webclient.length);
		// console.log("Clés wc : " + Object.keys(status.webclient));
		// console.log("Clés wc[0] : " + Object.keys(status.webclient)[0]);
		addDiv("2B2", "ia1", "ia", "green", "IA 1", "");
		addDiv("2B2", "ia2", "ia", "yellow", "IA 2", "");

		for(var i in status.webclient) {
			var client = status.webclient[i];
			// console.log(i);
			addDiv("2B1", i, "smartphone", "", client.ip, client.ip);
		}


		for(var i in status.client) {
			var client = status.client[i];
			addDiv("2B3", i, "robot", "", client.ip, client.ip);
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

/*
{"server":
		{"name":"Server","ip":"192.168.1.40:3128"},
	"webclient":
		{"Yp2ISL8HX-PA4LFbAAAB":
			{"name":"Webclient","type":"laptop","ip":"192.168.1.24"},
		"Xcdsfghfjxdz-PA4LFbAAAB":
			{"name":"Webclient","type":"laptop","ip":"192.168.1.25"}},
	"ia":{},
	"simulator":{},
	"client":
		{"4rdqJf8hHNXxq6mcAAAA":
			{"name":"Client","ip":"127.0.0.1"}}}


{ server: { name: 'Server', ip: '192.168.1.40:3128' },
  webclient: { HxGToWurI3JhLKx_AAAB: { name: 'Webclient', type: 'smartphone', ip: '192.168.1.24' } },
  ia: {},
  simulator: {},
  client: { MuCTYaSuSvBD9JzQAAAA: { name: 'Client', ip: '127.0.0.1' } } }
*/