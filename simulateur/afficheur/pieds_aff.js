function afficherPied(x,y,z,coul)
{
  /*  Entrees :
          x, y, z
          coul = hexa
  */

  loader.load("3d/pied_jaune.dae",function(collada){
    var dae = collada.scene;
    dae.effects["Material-effect"].shader.material.color = coul;
    dae.hauteur = 0.070;
    dae.position.set(x,y,z);
    dae.scale.set(1,1,1);
    scene.add(dae);
  });

}





