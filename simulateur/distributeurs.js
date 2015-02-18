function creerPopcorn(x,y,z){
    var geo = new THREE.SphereGeometry(0.02,60,60);
    var mat = new THREE.MeshLambertMaterial({color:'white',side:THREE.DoubleSide});
    var sphere = new THREE.Mesh(geo,mat);
    sphere.position.set(x,y,z);
    scene.add(sphere);
    return sphere;
}


function remplirDistributeur(distri){
    if(distri.tailleReservoir<5){
        var yy = distri.y+0.04*distri.tailleReservoir;
        distri.reservoir.push(creerPopcorn(distri.x,yy,distri.z));
        distri.tailleReservoir++;
    }
}

function viderDistributeur(distri){
    if(distri.tailleReservoir>0){
        var pop = distri.reservoir.shift();
        scene.remove(pop);
        distri.tailleReservoir--;
        return true;
    }else
        return false;
}

function creerDistributeur(n) {

    if(n>=1 && n<=4) {
        var position = [-1.2,-0.9,0.9,1.2];
        var xx = position[n - 1];
        var zz = -0.965;
        //le popcorn du dessous s'enfonce de 2.67mm
        var yy = (190 + 10 - 2.68) / 1000;
        return {num: n, tailleReservoir: 0, x: xx, y: yy, z: zz, reservoir: [],enVidage:false};
    }
}


function initDistributeur(distri){
    for(var i=1;i<=5;i++){
        remplirDistributeur(distri);
    }
}

function descendrePopcorn(distri){
    if(distri.tailleReservoir>0 && distri.reservoir[0].position.y>distri.y){
        for(var i=0;i<distri.tailleReservoir;i++){
            distri.reservoir[i].position.y -= 0.01;
        }
    }else{
        distri.enVidage = false;
    }
}

function deposerObjet(){
	
}