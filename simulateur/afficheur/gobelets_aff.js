





function afficherGobelet(x,y,z,coul){
    /*  Entrees :
            x, y, z
            coul = hexa
    */

    loader.load("3d/gobelet.dae",function(collada){
        var dae = collada.scene;
        dae.hauteur = 0.150;
        dae.position.set(x,y,z);
        collada.dae.effects["Material_002-effect"].shader.material.opacity = 0.65;
        collada.dae.effects["Material_002-effect"].shader.material.transparent = true;
        //collada.dae.effects["Material_002-effect"].shader.material.color = {coul.r:1,coul.g:0,coul.b:0}; 

        dae.scale.set(1,1,1);
        scene.add(dae);
    });
}


/*afficher les popcorn*/


function afficherPopcorn(x,y,z)
{
    /*  Entrees :
            x, y, z
    */
    var geo = new THREE.SphereGeometry(0.02,60,60);
    var mat = new THREE.MeshLambertMaterial({color:'white',side:THREE.DoubleSide});
    var popcorn = sphere.position.set(x,y,z);
    scene.add(popcorn);
}
















function initGobelets(tab){
    var posGobelets = [{x:-1.250,z:0.750},
                       {x:-0.590,z: -0.170},
                       {x:0,z: 0.650},
                       {x:0.590,z: -0.170},
                       {x:1.250,z: 0.750}];
    var positionY = 0.02;
    for(var i=0;i<5;i++)
        creerGobelet(tab,posGobelets[i].x,positionY,posGobelets[i].z);
}

function ajouterPopcorn(gob){

    var pos = [                                     //positions des popcorn dans le gobelet
        {x:0.005, y:0.02, z:-0.005},
        {x:-0.01, y:0.055, z:0.01},
        {x:0, y:0.085, z:-0.015},
        {x:0.012, y:0.105, z:0.016},
        {x:-0.021, y:0.117, z:-0.005},
        {x:0.0125, y:0.13, z:-0.02},
        {x:0.02, y:0.144 , z:0.017},
        {x:-0.021, y:0.15,z:0.016}];


    if(gob.tailleContenu<8){
        var geo = new THREE.SphereGeometry(0.02,60,60);
        var mat = new THREE.MeshLambertMaterial({color:'white',side:THREE.DoubleSide});
        var pop = new THREE.Mesh(geo,mat);
        pop.position.set(pos[gob.tailleContenu].x,pos[gob.tailleContenu].y,pos[gob.tailleContenu].z);
        gob.add(pop);
        gob.tailleContenu++;
    }
}


/*

function verifCollisionGobelet(gob){
	if(

}*/
