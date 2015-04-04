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

function afficherGR(x,y,z,yrot,coul){
	var geo = new THREE.BoxGeometry(0.25,0.35,0.35);
	var boxMat = [
				new THREE.MeshLambertMaterial({color:'blue',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided})];
	var mat = new THREE.MeshFaceMaterial( boxMat );
    var robot = new THREE.Mesh(geo,mat);
    robot.position.set(x,y,z);
    robot.rotation.y = yrot;
    scene.add(robot);
    GR = robot;
}



function afficherPR(x,y,z,yrot,coul){

	var geo = new THREE.BoxGeometry(0.15,0.35,0.20);
	var boxMat = [
				new THREE.MeshLambertMaterial({color:'blue',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided})];
	var mat = new THREE.MeshFaceMaterial( boxMat );
    var robot = new THREE.Mesh(geo,mat);
    robot.position.set(x,y,z);
    robot.rotation.y = yrot;
    scene.add(robot);
    PR = robot;
}

function afficherGE(x,y,z,coul){

	var geo = new THREE.CylinderGeometry( RAYON_ENNEMIS_GRANDS,RAYON_ENNEMIS_GRANDS,0.35,25);
	var boxMat = [
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided})];
	var mat = new THREE.MeshFaceMaterial( boxMat );
    var robot = new THREE.Mesh(geo,mat);
    robot.position.set(x,y,z);
    
    scene.add(robot);
    GE = robot;
}

function afficherPE(x,y,z,coul){

	var geo = new THREE.CylinderGeometry( RAYON_ENNEMIS_PETITS,RAYON_ENNEMIS_PETITS,0.35,25);
	var boxMat = [
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided})];
	var mat = new THREE.MeshFaceMaterial( boxMat );
    var robot = new THREE.Mesh(geo,mat);
    robot.position.set(x,y,z);
    
    scene.add(robot);
    PE = robot;
}

