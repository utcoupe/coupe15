//permet de redimensionner la fenetre
window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth*1,
        HEIGHT = window.innerHeight*0.75;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
});

var container = document.getElementById("container");

var scene= new THREE.Scene();

var renderer = new THREE.WebGLRenderer({antialias:true});

renderer.setSize(window.innerWidth,window.innerHeight*0.75);
renderer.setClearColor(0xff8c00,0.5);
container.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);

camera.position.z = 3;
camera.position.y = 1;
camera.lookAt(camera.position);

//gere les controles de la camera
controls = new THREE.OrbitControls(camera, renderer.domElement);





//lights

var directionLight = new THREE.DirectionalLight(0xffffff,1);
directionLight.position.set(-2,5,-2);
directionLight.intensity = 0.5;
scene.add(directionLight);

var directionLight2 = new THREE.DirectionalLight(0xffffff,1);
directionLight2.position.set(-2,5,2);
directionLight.intensity2 = 0.5;
scene.add(directionLight2);

var directionLight3 = new THREE.DirectionalLight(0xffffff,1);
directionLight3.position.set(2,5,-2);
directionLight.intensity3 = 0.5;
scene.add(directionLight3);

var directionLight4 = new THREE.DirectionalLight(0xffffff,1);
directionLight4.position.set(2,5,2);
directionLight.intensity4 = 0.5;
scene.add(directionLight4);


var axisHelper = new THREE.AxisHelper( 5 ); scene.add( axisHelper );

//charge le plateau
var loader = new THREE.ColladaLoader();
loader.options.convertUpAxis = true;
loader.load('3d/plateau_mieux.dae',function(collada){
    var dae = collada.scene;
    var skin = collada.skins[0];
    var plateau = dae;
    //rendre les cylindres transparents
    collada.dae.effects["transparent_003-effect"].shader.material.opacity = 0.2;
    collada.dae.effects["transparent_003-effect"].shader.material.transparent = true;

    dae.position.set(0,0,0);
    dae.scale.set(1,1,1);
    scene.add(dae);
})







//tester ici **********************************
var tabClapets = initClapets();
var fermeture = false;
var vidage = false;

/*window.addEventListener('keydown', function(event) {
    // en fonction de la touche on ferme un certain clapet
    // on met fermeture a true pour verfifer chaque clapet 1 fois
    // tant qu'un clapet a bouge on continue
    // si aucun clapet ne bouge fermeture est remis a false
    var k = event.which;
    if(k>=97 && k<=102) {
        tabClapets[k - 97].enFermeture = true;
        fermeture = true;
    }else if(k>=65 && k<=68 && !tabDistributeurs[k-65].enVidage){
       	if(robot4.prendrePopcorn(tabDistributeurs[k-65])){
        	tabDistributeurs[k - 65].enVidage = true;
        	vidage = true;
        }
    }
});*/

var tabDistributeurs = [];
for(var i=0;i<4;i++) {
    tabDistributeurs.push(creerDistributeur(i));
}





//var pied = creerPied("jaune",0,0.01,0);
var tabPiedsJaunes = [];
var tabPiedsVerts = [];

initPieds(tabPiedsJaunes,tabPiedsVerts);

var tabGobelets = [];
//creerGobelet(tabGobelets,0,0.01,0);
initGobelets(tabGobelets);
//attention !!!!
// tab est mis a jour  la fin seulement

var tabAmpoules = [];
initAmpoules(tabAmpoules);


//robot1 : grand
//robot2: petit
//robot3 : grand ennemi
//robot4: petit ennemi


window.addEventListener("keydown",function(event){
	switch(event.which){
		case 97:
			fermeture = true;
			robot4.fermerClapet(tabClapets[3]);
			break;
		case 86: 
			//robot4.avancer(0.01);
			robot4.enDeplacement = true;
			robot4.aParcourir.valeur = 0.1;
			robot4.aParcourir.sens = "avant";
			break;
		case 82:
			//robot4.reculer(0.01);
			robot4.enDeplacement = true;
			robot4.aParcourir.valeur = 0.1;
			robot4.aParcourir.sens = "arriere";
			break;
		case 71:
			//robot4.tournerGauche(10);
			robot4.enRotation = true;
			robot4.aTourner.valeur = 45;
			robot4.aTourner.sens = "gauche";
			break;
		case 72:
			//robot4.tournerDroite(10);
			robot4.enRotation = true;
			robot4.aTourner.valeur = 45;
			robot4.aTourner.sens = "droite";
			break;
		case 74:
			//robot4.prendreObjet(tabGobelets[1]);
			robot4.prendreObjet(tabPiedsVerts[1]);
			break;
		case 75:
			//robot4.prendreObjet(tabGobelets[1]);
			robot4.prendreObjet(tabPiedsVerts[2]);
			break;
		case 76:
			//robot4.prendreObjet(tabGobelets[1]);
			robot4.prendreObjet(tabGobelets[2]);
			break;
		case 77:
			//robot4.prendreObjet(tabGobelets[1]);
			robot4.prendreObjet(tabPiedsJaunes[1]);
			break;
		case 78:
			//robot4.prendreObjet(tabGobelets[1]);
			robot4.deposerObjet(0);
			break;
		case 79:
			//robot4.prendreObjet(tabGobelets[1]);
			robot4.prendreObjet(tabAmpoules[2]);
			break;		
	}

})

var robot1 = creerRobotPrincipal("gauche");
var robot2 = creerRobotSecondaire("gauche");

var robot3 = creerRobotPrincipal("droit");
var robot4 = creerRobotSecondaire("droit");

var tabRobots = [robot1,robot2,robot3,robot4];
var rob;
//**************************************





function render(){

    requestAnimationFrame(render);
    if(fermeture)
        for(var i=0;i<=5;i++)
            if (tabClapets[i].enFermeture) {
                tabClapets[i].fermer();
                fermeture = true;
            }

    if(vidage){
        for(var i=0;i<4;i++)
            if(tabDistributeurs[i].enVidage){
                tabDistributeurs[i].descendrePopcorn();
                vidage = true;
            }
    }



    for(var r=0;r<4;r++){
    	rob = tabRobots[r];
	    if(rob.enDeplacement && rob.aParcourir.valeur > 0){
	    	if(rob.aParcourir.sens === "avant"){ //avancer
	    	    if(rob.avancer(rob.vitesseDeplacement))
	    			rob.aParcourir.valeur -= rob.vitesseDeplacement;
	    		else{   //collision
	    			console.log("Robot : ",rob.nom," collision");
	    			rob.aParcourir.valeur = 0;
	    			rob.enDeplacement = false;
	    		}
	    	}else if(rob.aParcourir.sens === "arriere"){  //reculer
	    		if(rob.reculer(rob.vitesseDeplacement))
	    			rob.aParcourir.valeur -= rob.vitesseDeplacement;
	    		else{   //collision
	    			console.log("Robot : ",rob.nom," collision");
	    			rob.aParcourir.valeur = 0;
	    			rob.enDeplacement = false;
	    		}
	    	}
	    }else{
	    	rob.enDeplacement = false;
	    	rob.aParcourir.valeur = 0;
	    }


	    if(rob.enRotation && rob.aTourner.valeur > 0){
	    	if(rob.aTourner.sens === "gauche"){
	    		if(rob.tournerGauche(rob.vitesseRotation)){
	    			rob.aTourner.valeur -= rob.vitesseRotation;
	    		}else{
	    			console.log("Robot : ",rob.nom," collision");
	    			rob.aTourner.valeur = 0;
	    			rob.enRotation = false;
	    		}
	    	}else{
	    		if(rob.tournerDroite(rob.vitesseRotation)){
	    			rob.aTourner.valeur -= rob.vitesseRotation;
	    		}else{
	       			console.log("Robot : ",rob.nom," collision");
	    			rob.aTourner.valeur = 0;
	    			rob.enRotation = false;
	    			}
	    	}
	    }else{
	    	rob.enRotation = false;
	    	rob.aTourner.valeur = 0;
	    }
	}



    renderer.render(scene,camera);

    controls.update();
}

render();



function commande(){
	var robot = tabRobots[document.getElementById('selectRobot').value-1];
	var action = document.getElementById('selectAction').value;
	//console.log("robot = ",robot);
	console.log("action = ",action);


	switch(action){
		case "avancer": 
			//robot4.avancer(0.01);
			robot.enDeplacement = true;
			robot.aParcourir.valeur = 0.1;
			robot.aParcourir.sens = "avant";
			break;
		case "reculer":
			//robot4.reculer(0.01);
			robot.enDeplacement = true;
			robot.aParcourir.valeur = 0.1;
			robot.aParcourir.sens = "arriere";
			break;
		case "tournerGauche":
			//robot4.tournerGauche(10);
			robot.enRotation = true;
			robot.aTourner.valeur = 45;
			robot.aTourner.sens = "gauche";
			break;
		case "tournerDroite":
			//robot4.tournerDroite(10);
			robot.enRotation = true;
			robot.aTourner.valeur = 45;
			robot.aTourner.sens = "droite";
			break;
		case "prendrePopcorn":
			for(var d=0;d<4;d++)
				if(robot.verifCibleAtteignable({x:tabDistributeurs[d].x,z:tabDistributeurs[d].z}))
				{
					robot.prendrePopcorn(tabDistributeurs[d]);
					vidage = true;
					tabDistributeurs[d].enVidage = true;
				}
			break;
		case "prendreObjet":
			var pris = false;
			for(var p=0;p<8 && !pris;p++)
				if(robot.prendreObjet(tabPiedsJaunes[p]))
					pris = true;
			for(var p=0;p<8 && !pris;p++)
				if(robot.prendreObjet(tabPiedsVerts[p]))
					pris = true;
			for(var p=0;p<5 && !pris;p++)
				if(robot.prendreObjet(tabGobelets[p]))
					pris = true;
			break;
		case "deposerObjet":
			robot.deposerObjet(0);
			break;
	}

}

/* A ajouter 

- gerer les ampoules
- gerer la construction d'objets


*/

