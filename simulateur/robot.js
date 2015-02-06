/**
 * Created by matthieu on 03/02/15.
 */


function creerRobotPrincipal(){
    var geo = new THREE.BoxGeometry();
    var mat = new THREE.MeshLambertMaterial({color:'grey',side:THREE.doubleSided});
    var robot = new THREE.Mesh(geo,mat);
    scene.add(robot);
    return robot;
}
