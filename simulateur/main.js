//permet de redimensionner la fenetre
window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
});

var container = document.getElementById("container");

var scene= new THREE.Scene();

var renderer = new THREE.WebGLRenderer({antialias:true});

renderer.setSize(window.innerWidth,window.innerHeight);
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
directionLight2.position.set(-2,4,2);
directionLight.intensity2 = 0.5;
scene.add(directionLight2);
var directionLight3 = new THREE.DirectionalLight(0xffffff,1);
directionLight3.position.set(2,3,-2);
directionLight.intensity3 = 0.5;
scene.add(directionLight3);
var directionLight4 = new THREE.DirectionalLight(0xffffff,1);
directionLight4.position.set(2,2,2);
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

window.addEventListener('keydown', function(event) {
    // en fonction de la touche on ferme un certain clapet
    // on met fermeture a true pour verfifer chaque clapet 1 fois
    // tant qu'un clapet a bouge on continue
    // si aucun clapet ne bouge fermeture est remis a false
    var k = event.which;
    if(k>=97 && k<=102) {
        tabClapets[k - 97].enFermeture = true;
        fermeture = true;
    }else if(k>=65 && k<=68 && !tabDistributeurs[k-65].enVidage){
        if(viderDistributeur(tabDistributeurs[k-65])) {
            tabDistributeurs[k - 65].enVidage = true;
            vidage = true;
        }

    }

});

var tabDistributeurs = [];
for(var i=1;i<=4;i++) {
    tabDistributeurs.push(creerDistributeur(i));
    initDistributeur(tabDistributeurs[i-1]);
}





//var pied = creerPied("jaune",0,0.01,0);
var tabPiedsJaunes = [];

initPieds(tabPiedsJaunes);

var tabGobelets = [];
//creerGobelet(tabGobelets,0,0.01,0);
initGobelets(tabGobelets);
//attention !!!!
// tab est mis a jour  la fin seulement

var tabAmpoules = [];
initAmpoules(tabAmpoules);

//**************************************





function render(){

    requestAnimationFrame(render);
    if(fermeture)
        for(var i=0;i<=5;i++)
            if (tabClapets[i].enFermeture) {
                fermerClapet(tabClapets[i]);
                fermeture = true;


            }

    if(vidage){
        for(var i=0;i<4;i++)
            if(tabDistributeurs[i].enVidage){
                descendrePopcorn(tabDistributeurs[i]);
                vidage = true;
            }
    }
    renderer.render(scene,camera);

    controls.update();
}

render();

