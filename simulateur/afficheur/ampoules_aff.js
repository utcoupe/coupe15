


function afficherAmpoule(x,y,z,coul)
{
    /*  Entrees
            x, y, z
            coul = hexa
    */

    var geo = new THREE.SphereGeometry(0.0325,60,60);
    var mat = new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSide});
    var ampoule = new THREE.Mesh(geo,mat);
    ampoule.position.set(x,y,z);
    scene.add(ampoule);
    ampoules.push(ampoule);
}

