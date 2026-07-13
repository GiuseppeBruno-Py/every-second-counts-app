/* Compasso · Guardiã original e configurável do Mundo do Compasso */
(function(root, factory) {
  const api = Object.freeze(factory());
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CompassoWorldCharacter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const defaults = Object.freeze({ name:'Guardiã do Compasso', skin:0xdba783, cloak:0x56517e, tunic:0xe7caa1, hat:0x454264, compass:0xf1ba59 });
  function create(THREE, options = {}) {
    if (!THREE) throw new TypeError('Three.js é necessário para criar a personagem');
    const config = { ...defaults, ...options };
    const group = new THREE.Group(); group.name = config.name;
    const flat = color => new THREE.MeshStandardMaterial({ color, roughness:.88, metalness:0, flatShading:true });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.34,.56,3,6), flat(config.tunic)); body.position.y=.75; group.add(body);
    const cloak = new THREE.Mesh(new THREE.ConeGeometry(.5,1.05,6), flat(config.cloak)); cloak.position.set(0,.62,.14); cloak.rotation.x=.12; group.add(cloak);
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(.3,1), flat(config.skin)); head.position.y=1.48; group.add(head);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.08,10), flat(config.hat)); brim.position.y=1.72; group.add(brim);
    const hat = new THREE.Mesh(new THREE.ConeGeometry(.34,.62,8), flat(config.hat)); hat.position.set(.04,1.98,0); hat.rotation.z=-.12; group.add(hat);
    const scroll = new THREE.Mesh(new THREE.BoxGeometry(.38,.26,.07), flat(0xf0dfb8)); scroll.position.set(.43,.84,-.23); scroll.rotation.z=-.22; group.add(scroll);
    const compass = new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.035,12), flat(config.compass)); compass.position.set(0,1.02,-.42); compass.rotation.x=Math.PI/2; group.add(compass);
    const needle = new THREE.Mesh(new THREE.ConeGeometry(.035,.16,4), flat(0xa84f45)); needle.position.set(0,1.03,-.445); needle.rotation.z=Math.PI; group.add(needle);
    group.scale.setScalar(.9); group.userData = { config, body, head, scroll };

    function update(elapsed, mode = 'idle', reduced = false) {
      const amount = reduced ? 0 : 1;
      group.position.y = (Number(group.userData.groundY) || 0) + Math.sin(elapsed * 2.2) * .025 * amount;
      group.rotation.z = Math.sin(elapsed * 1.3) * .015 * amount;
      if (mode === 'walking') {
        group.rotation.z = Math.sin(elapsed * 9) * .055 * amount;
        scroll.rotation.z = -.22 + Math.sin(elapsed * 9) * .1 * amount;
      } else if (mode === 'reading' || mode === 'writing') {
        head.rotation.x = .18; scroll.position.y = .98;
      } else if (mode === 'focus') {
        head.rotation.x = -.03; scroll.position.y = .84;
      } else {
        head.rotation.x = 0; scroll.position.y = .84;
      }
    }
    return Object.freeze({ group, config:Object.freeze(config), update });
  }

  return { defaults, create };
});
