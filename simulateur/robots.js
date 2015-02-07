/*

petit : 
x: 0.15
y: 0.35
z: 0.20

grand :
x: 0.25
y: 0.35
z: 0.35

*/




function creerRobotPrincipal(cote){
	var posx = {"gauche":-1.5+0.125+0.07,"droit":1.5-0.125-0.07};
    var geo = new THREE.BoxGeometry(0.25,0.35,0.35);
    


    //var mat = new THREE.MeshLambertMaterial({color:'grey',side:THREE.doubleSided});
    var boxMat = [
		new THREE.MeshLambertMaterial({color:'yellow',side:THREE.doubleSided}),
		new THREE.MeshLambertMaterial({color:'grey',side:THREE.doubleSided}),
		new THREE.MeshLambertMaterial({color:'grey',side:THREE.doubleSided}),
		new THREE.MeshLambertMaterial({color:'grey',side:THREE.doubleSided}),
		new THREE.MeshLambertMaterial({color:'grey',side:THREE.doubleSided}),
		new THREE.MeshLambertMaterial({color:'grey',side:THREE.doubleSided})];

	if(cote=="droit"){
		var temp = boxMat[4];
		boxMat[4] = boxMat[0];
		boxMat[0] = temp;
		boxMat.reverse();
	}
	var mat = new THREE.MeshFaceMaterial( boxMat );

    var robot = new THREE.Mesh(geo,mat);


    robot.position.set(posx[cote],0.185,0);
    var vect = new THREE.Vector3(robot.position.x,0,robot.position.z);
    robot.direction = vect.negate().normalize();
    

    robot.avancer = avancer;
    robot.tourner = tourner;

    scene.add(robot);
    return robot;
}


function creerRobotSecondaire(cote){
	var posx = {"gauche":-1.5+0.125+0.07+0.25,"droit":1.5-0.125-0.07-0.25};
	var geo = new THREE.BoxGeometry(0.15,0.35,0.20);
	var mat = new THREE.MeshLambertMaterial({color:"brown",side:THREE.doubleSided});
	var rob = new THREE.Mesh(geo,mat);
	rob.position.set(posx[cote],0.185,0);
	scene.add(rob);
	return rob;
}


function avancer(d){
	this.translateOnAxis(this.direction,d);
}

function tourner(deg){
	var rad = deg*Math.PI/180;
	this.rotation.y += rad;
}