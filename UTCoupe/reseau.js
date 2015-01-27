/*
-----------> y
|
|     (dans un svg)
|
\/
x


*/

function linkDivs (div1Id, div2Id, colId) {
	console.log("Lien de " + div1Id + " vers " + div2Id)
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

	for (var i = 0; i < links.arrows1.length; i++) {
		var link = links.arrows1[i];
		linkDivs("t"+link[0], "t"+link[1], "arrows1");
	};

	for (var i = 0; i < links.arrows2.length; i++) {
		var link = links.arrows2[i];
		linkDivs("t"+link[0], "t"+link[1], "arrows2");
	};

	for (var i = 0; i < links.arrows3.length; i++) {
		var link = links.arrows3[i];
		linkDivs("t"+link[0], "t"+link[1], "arrows3");
	};
}

function removeLinks (id) {
	console.log("Removing t" + id);
	for (var j = 1; j <= Object.keys(links).length; j++) {
		var alink = links["arrows"+j];
		for (var i = 0; i < alink.length; i++) {
			console.log(alink[i][0]);
			console.log(alink[i][1]);
			if (alink[i][0] == id || alink[i][1] == id){
				console.log("Link " + alink[i] + " just removed");
				alink.splice(i, 1);
			}
		};
	};
}

document.getElementById("change").onclick = function (){
	links = {"arrows1":
				[[5, 2]],
			"arrows2":
				[[2, 3],
				[2, 6]],
			"arrows3":
				[[3, 4]]
			};

	updateArrows();
};

document.getElementById("add").onclick = function (){
	nb_dev++;
	document.getElementById("webclients").innerHTML += "<div class='thing' id='t" + nb_dev + "'> Truc </div>";
	if (document.getElementById("t2") != null)
		links.arrows1[links.arrows1.length] = [nb_dev, 2];

	updateArrows();
};

document.getElementById("remove").onclick = function (){
	var toBeRemoved = 0;
	do {
		toBeRemoved = Math.floor(Math.random() * nb_dev + 1);
	} while (document.getElementById("t"+toBeRemoved) == null && toBeRemoved != 2);

	document.getElementById("t"+toBeRemoved).remove();
	if (document.getElementById("change") != null)
		document.getElementById("change").remove();

	console.log(links);
	removeLinks(toBeRemoved);
	console.log(links);

	updateArrows();
};

var nb_dev = 6;
var links = {"arrows1":
				[[1, 2],
				[5, 2]],
			"arrows2":
				[[2, 3]],
			"arrows3":
				[[6, 4]]
			};

updateArrows();