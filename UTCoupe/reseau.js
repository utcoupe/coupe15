(function (){
"use strict";
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
        newDiv.innerHTML += "<br>Impossible de se connecter !";
    else if(ip != "")
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
        var currentSize = window.getComputedStyle(document.getElementById(current.id)).height.replace("px", "");
        var parentSize = window.getComputedStyle(document.getElementById(current.parentElement.id)).height.replace("px", "");
        current.style.marginTop = (parentSize - currentSize) / 2;
    }
}

function updateLayout (status) {
    clearColumns();

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
            addDiv("2B1", i, "smartphone", "", client.name, client.ip);
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
    var middleDiv1 = document.getElementById(div1Id).offsetTop + parseFloat(window.getComputedStyle(document.getElementById(div1Id)).marginTop) + window.getComputedStyle(document.getElementById(div1Id)).height.replace("px", "")/2;
    var middleDiv2 = document.getElementById(div2Id).offsetTop + parseFloat(window.getComputedStyle(document.getElementById(div2Id)).marginTop) + window.getComputedStyle(document.getElementById(div2Id)).height.replace("px", "")/2;
    var widthCol = window.getComputedStyle(document.getElementById(colId)).width.replace("px", "");
    document.getElementById(colId).innerHTML += "<path d='M0," + middleDiv1 + " L" + widthCol + "," + middleDiv2 + "' class='link'/>";   
}

function linkDivsArc (div1Id, div2Id, colId) {
    var middleDiv1 = document.getElementById(div1Id).offsetTop + parseFloat(window.getComputedStyle(document.getElementById(div1Id)).marginTop) + window.getComputedStyle(document.getElementById(div1Id)).height.replace("px", "")/2;
    var middleDiv2 = document.getElementById(div2Id).offsetTop + parseFloat(window.getComputedStyle(document.getElementById(div2Id)).marginTop) + window.getComputedStyle(document.getElementById(div2Id)).height.replace("px", "")/2;
    var widthCol = window.getComputedStyle(document.getElementById(colId)).width.replace("px", "");
    var dist = middleDiv2 - middleDiv1;
    var side = dist>0?0:1;
    var path = "<path d='M " + widthCol + "," + middleDiv1 + " a" + Math.abs(dist) + "," + Math.abs(dist) + " 0 0 " + side + " 0," + dist + "' class='link'/>";
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
        linkDivsArc(source, "server", "arrows1");
    }

    // TODO : penser à ajouter les créations de links avec les I/O
}

/* --------- Events ------------- */

document.getElementById("updateGetClients").addEventListener('click', function (e){
    // penser à virer le JSON parse !!
    updateLayout(JSON.parse(document.querySelector("textarea#getClients").value));
}, true);

window.onresize = function () {
    updateLayout(document.querySelector("textarea#getClients").value);
};


/* --------- "Main" ------------- */
var defaultStatus = {};

updateLayout(defaultStatus);
})();

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