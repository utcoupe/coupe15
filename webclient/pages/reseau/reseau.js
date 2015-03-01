angular.module('app').controller('ReseauCtrl', ['$scope', function($scope) {
	// $scope.name = "lol";

	/* --------- Prints ------------- */
	function addDiv (parentId, currentId, type, color, name, ip) {
	    // possible colors : error, green, yellow, transparent or normal (just "" )

	    var newDiv = document.createElement('div');

	    var more = "";
	    if (parentId == "2B1") 
	        more = " webclient";
	    else if (parentId == "2B3") 
	        more = " client";
	    else if ((parentId == "2B2") && (type != "server"))
	        more = " brain";
	    more += " " + color;

	    newDiv.id    = currentId;
	    newDiv.title = "ID de l'appareil : " + currentId;
	    newDiv.setAttribute('class', "thing device" + type + more);

	    newDiv.innerHTML = "<h3>" + name + "</h3>";
	    if(color == "error")
	        newDiv.innerHTML += "<br><span class='ip'>Impossible de se connecter !</span>";
	    else if(ip != "")
	        newDiv.innerHTML += "<br><span class='ip'>"+ip+"</span>";

	    document.getElementById(parentId).appendChild(newDiv);
	}

	function printNotConnected () {
	    clearArrows();
	    var blocstoBeCentered = document.querySelectorAll(".toBeCentered");

	    for(var i=0; i < blocstoBeCentered.length; i++) {
	        var current = blocstoBeCentered[i];
	        current.innerHTML = "";
	    }

	    addDiv("2B1", "owner", "laptop", "", "Toi", "127.0.0.1");
	    addDiv("2B2", "server", "server", "error", "Serveur", "?");
	}



	/* --------- Layout ------------- */

	function resizeWC () {
	    // TODO ATTENTION !!  Cette fonction fonctionne mal !
	    var divs = document.querySelectorAll(".webclient");
	    // console.log(divs);
	    if (divs.length > 0) {
	        var firstDiv = window.getComputedStyle(divs[0]);

	        if ((parseFloat(firstDiv.height) + parseFloat(firstDiv.marginTop)) * divs.length > window.getComputedStyle(document.getElementById("webclients")).height.replace("px", "")) {
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
	        }
	    }
	}

	function centerBlocs () {
	    // Centers divs "toBeCentered" verticaly

	    var blocstoBeCentered = document.querySelectorAll(".toBeCentered");

	    for(var i=0; i < blocstoBeCentered.length; i++) {
	        var current = blocstoBeCentered[i];
	        var currentSize = $("#"+current.id).height();
	        var parentSize =$("#"+current.id).parent().height();
	        $("#"+current.id).css({ "margin-top": ((parentSize - currentSize) / 2)+"px" });
	    }
	}

	function updateLayout (status) {
	    clearColumns();

	    // Update content size
	    $("#page").height(0.95*($( window ).height() - $("#page").offset().top));

	    if (!!status && !!status.server){
	        // Adds divs

	        var client, i;

	        if (Object.keys(status.simulator).length == 1) {
	            addDiv("2B2", "simu", "simu", "", "Simulateur", "");
	        }

	        addDiv("2B2", "server", "server", "", "Serveur", status.server.ip);

	        if (Object.keys(status.ia).length !== 0) {
	            addDiv("2B2", "ia1", "ia", "green", "IA 1", "");
	            addDiv("2B2", "ia2", "ia", "yellow", "IA 2", "");
	        }

	        for(i in status.webclient) {
	            client = status.webclient[i];
	            // console.log(i);
	            addDiv("2B1", i, client.type, "", client.name, client.ip);
	        }


	        for(i in status.client) {
	            client = status.client[i];
	            addDiv("2B3", i, "robot", "", client.name, client.ip);
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
		var div1OffsetTop = $("#"+div1Id).offset().top - $("#"+div1Id).parent().offset().top;
		var div2OffsetTop = $("#"+div2Id).offset().top - $("#"+div2Id).parent().offset().top;
	    var middleDiv1 =  div1OffsetTop + parseFloat($("#"+div1Id).parent().css("margin-top")) + $("#"+div1Id).outerHeight()/2;
	    var middleDiv2 = div2OffsetTop + parseFloat($("#"+div2Id).parent().css("margin-top")) + $("#"+div2Id).outerHeight()/2;
	    console.log("Milieu div " + $("#"+div1Id).offset().top + "-" + $("#"+div1Id).parent().offset().top + "=" + div1OffsetTop + "+ moitié:" + $("#"+div1Id).outerHeight() + "=" + middleDiv1);
	    var widthCol = $("#"+colId).width();
	    document.getElementById(colId).innerHTML += "<path d='M0," + middleDiv1 + " L" + widthCol + "," + middleDiv2 + "' class='link'/>";   
	}

	function linkDivsArc (div1Id, div2Id, colId) {
	    var middleDiv1 = document.getElementById(div1Id).offsetTop + parseFloat(window.getComputedStyle(document.getElementById(div1Id)).marginTop) + window.getComputedStyle(document.getElementById(div1Id)).height.replace("px", "")/2;
	    var middleDiv2 = document.getElementById(div2Id).offsetTop + parseFloat(window.getComputedStyle(document.getElementById(div2Id)).marginTop) + window.getComputedStyle(document.getElementById(div2Id)).height.replace("px", "")/2;
	    var dist = middleDiv2 - middleDiv1;
	    var side = dist>0?1:0;
	    var path = "<path d='M 0," + middleDiv1 + " a" + Math.abs(dist) + "," + Math.abs(dist) + " 0 0 " + side + " 0," + dist + "' class='link'/>";
	    document.getElementById(colId).innerHTML += path;
	}

	function clearArrows () {
	    document.getElementById("arrows1").innerHTML = "";
	    document.getElementById("arrows2").innerHTML = "";
	    document.getElementById("arrows3").innerHTML = "";
	}

	function updateArrows (){
	    clearArrows();
	    var source, target;

	    for (var i = 0; i < document.querySelectorAll(".webclient").length; i++) {
	        source = document.querySelectorAll(".webclient")[i].id;
	        linkDivs(source, "server", "arrows1");
	    }

	    for (i = 0; i < document.querySelectorAll(".client").length; i++) {
	        target = document.querySelectorAll(".client")[i].id;
	        linkDivs("server", target, "arrows2");
	    }

	    for (i = 0; i < document.querySelectorAll(".brain").length; i++) {
	        source = document.querySelectorAll(".brain")[i].id;
	        linkDivsArc(source, "server", "arrows2");
	    }

	    // TODO : penser à ajouter les créations de links avec les I/O
	}

	/* --------- Clients events ------------- */
	client.order(function (from, name, params){
		console.log("[Network log] Network updated")
		status = params.network;

		if (name = "reseau")
		    updateLayout(status);
	});

	window.onresize = function () {
	    updateLayout(status);
	};

	// Adds the possibility to edit a span content (uncomment updateIpServer too)
	// function addServerEvents(){
	//     $(document).one("click", "#server span.ip", function(e) {
	//         $(this).html("<input type='text' id='ipServer' style='width:70%' value='"+$(this).html()+"'></input><button id='updateIpServer'>✓</button>");

	//         $("#ipServer").select();

	//         $(document).one("click", "#updateIpServer", function(e) {
	//             updateIpServer($("#ipServer").val());

	//             addServerEvents();
	//         });
	//     });
	// }

	/* --------- Server communication ------------- */
	// function updateIpServer(ip){
	//     // TODO : Penser à changer la fonction !
	//     $("#server .ip").html(ip);
	// }

	/* --------- Server events ------------- */


	/* --------- "Main" ------------- */
	var status = {};

	updateLayout(defaultStatus);
	// addServerEvents();




}]);