angular.module('app').controller('ReseauCtrl', ['$rootScope', '$scope', 'Reseau',
	function($rootScope, $scope, Reseau) {
	$rootScope.act_page = 'reseau';
	Reseau.updateLayout(Reseau.network);
}]);

angular.module('app').service('Reseau', ['$rootScope', 'Client', function($rootScope, Client) {
	this.network = {};

	/* --------- Prints ------------- */
		function addDiv (parentId, currentId, type, color, name, ip) {
		    // possible colors : error, green, yellow, waiting, ok, starting, everythingIsAwesome or normal (just "" )

		    var newDiv = document.createElement('div');

		    var more = "";
		    if (parentId == "webclients") 
		        more = " webclient";
		    else if (parentId == "clients") 
		        more = " client";
		    else if ((parentId == "brain") && (type != "server"))
		        more = " brain";
		    more += " " + color;

		    newDiv.id    = currentId;
		    newDiv.title = "ID de l'appareil : " + currentId + "\nStatus : "+color;
		    newDiv.setAttribute('class', "thing device" + type + more);

		    newDiv.innerHTML = "<h3>" + name + "</h3>";
		    if(color == "error")
		        newDiv.innerHTML += "<br/><span class='ip'>Impossible de se connecter !</span>";
		    else if(ip !== "")
		        newDiv.innerHTML += "<br/><span class='ip'>"+ip+"</span>";

		    document.getElementById(parentId).appendChild(newDiv);
		}

		function printNotConnected () {
		    clearArrows();
		    var devices = document.querySelectorAll(".rects");

		    for(var i=0; i < devices.length; i++) {
		        var current = devices[i];
		        current.innerHTML = "";
		    }

		    addDiv("webclients", "owner", "laptop", "", "Toi", "127.0.0.1");
		    addDiv("brain", "server", "server", "error", "Serveur", "?");
		}



	/* --------- Layout ------------- */
		this.updateLayout = function (status) {
		    clearColumns();

		    // Update content size
		    $("#page").height(0.95*($( window ).height() - $("#page").offset().top));
		    

		    if (!!status && !!status.server){
		        // Adds divs

		        var client, i;

		        if (Object.keys(status.simulator).length == 1) {
		            addDiv("brain", "simu", "simu", "", "Simulateur", "");
		        }

		        addDiv("brain", "server", "server", "", "Serveur", status.server.ip);

		        if (Object.keys(status.ia).length !== 0) {
		            addDiv("brain", "ia1", "ia", "green", "IA 1", "");
		            addDiv("brain", "ia2", "ia", "yellow", "IA 2", "");
		        }

		        for(i in status.webclient) {
		            client = status.webclient[i];
		            addDiv("webclients", i, client.type, "", client.name, client.ip);
		        }

		        for(i in status.hokuyo) {
		            client = status.hokuyo[i];
		            addDiv("clients", i, "hok", client.status, "Hokuyo", client.ip);
		        }

		        for(i in status.gr) {
		            client = status.gr[i];
		            addDiv("clients", i, "robot", client.status, "Oscar (GR)", client.ip);
		        }

		        for(i in status.pr) {
		            client = status.pr[i];
		            addDiv("clients", i, "robot", client.status, "Cesar (PR)", client.ip);
		        }

		        updateArrows();
		    } else
		        printNotConnected();
		};

		function clearColumns () {
		    document.getElementById("webclients").innerHTML = "";
		    document.getElementById("brain").innerHTML = "";
		    document.getElementById("clients").innerHTML = "";
		}



	/* --------- Links ------------- */

		function linkDivs (div1Id, div2Id, colId) {
			var div1OffsetTop = $("#"+div1Id).offset().top - $("#"+div1Id).parent().offset().top;
			var div2OffsetTop = $("#"+div2Id).offset().top - $("#"+div2Id).parent().offset().top;
		    var middleDiv1 =  div1OffsetTop + parseFloat($("#"+div1Id).parent().css("margin-top")) + $("#"+div1Id).outerHeight()/2;
		    var middleDiv2 = div2OffsetTop + parseFloat($("#"+div2Id).parent().css("margin-top")) + $("#"+div2Id).outerHeight()/2;
		    var widthCol = $("#"+colId).width();
		    document.getElementById(colId).innerHTML += "\n<path d='M0," + middleDiv1 + " L" + widthCol + "," + middleDiv2 + "' class='link'/>";   
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


	// Edit span content
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

	this.init = function (){
		Client.order(function (from, name, params){
			if (name == "reseau"){
			// console.log("[Network log] Network updated");
				this.network = params.network;

				if ($rootScope.act_page == 'reseau') {
				    this.updateLayout(this.network);
					$rootScope.$apply();
				}
			}
		}.bind(this));


		window.onresize = function () {
			if ($rootScope.act_page == 'reseau') {
		    	this.updateLayout(this.network);
			}
		}.bind(this);

		// setInterval(function () {
		//     this.updateLayout(this.network);
		// }.bind(this), 1000);
	};

}]);