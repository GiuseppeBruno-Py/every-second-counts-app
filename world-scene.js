/* Compasso · Cena Three.js procedural do Mundo do Compasso */
(function(root, factory) {
  const api = Object.freeze(factory(root));
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CompassoWorldScene = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(root) {
  'use strict';

  function shade(color, amount) {
    const r = Math.max(0, Math.min(255, (color >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((color >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (color & 255) + amount));
    return (r << 16) | (g << 8) | b;
  }

  async function create(canvas, options = {}) {
    if (!canvas) throw new TypeError('Canvas do mundo não encontrado');
    const THREE = await import('./vendor/three/three.module.min.js');
    const locations = options.locations || root.CompassoWorldLocations?.locations || [];
    const quality = options.quality || { pixelRatio:1, shadows:false, particles:0, foliage:.5, antialias:false };
    const reducedMotion = Boolean(options.reducedMotion);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:Boolean(quality.antialias), alpha:false, powerPreference:quality.id === 'economy' ? 'low-power' : 'high-performance' });
    renderer.setPixelRatio(Math.min(quality.pixelRatio || 1, root.devicePixelRatio || 1));
    renderer.setClearColor(0xc7d7c3, 1);
    renderer.shadowMap.enabled = Boolean(quality.shadows);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xc8d9ca);
    scene.fog = new THREE.FogExp2(0xc8d9ca, .017);
    const camera = new THREE.OrthographicCamera(-12,12,8,-8,.1,100);
    camera.position.set(17,18,17); camera.lookAt(0,0,0);
    const world = new THREE.Group(); scene.add(world);
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const interactive = [];
    const locationGroups = new Map();
    let metrics = options.metrics || {};
    let characterMode = 'idle';
    let move = null;
    let frame = 0;
    let lastFrame = 0;
    let disposed = false;

    const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness:.88, metalness:0, flatShading:true, ...extra });
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(14,15,.6,12), material(0x78966d));
    ground.position.y=-.38; ground.receiveShadow=true; world.add(ground);
    const innerGround = new THREE.Mesh(new THREE.CylinderGeometry(12.5,13,.25,12), material(0xa4b989));
    innerGround.position.y=-.04; innerGround.receiveShadow=true; world.add(innerGround);
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.5,.15,12), material(0xc3ad91));
    plaza.position.y=.12; plaza.receiveShadow=true; world.add(plaza);

    function mesh(geometry, color) {
      const item = new THREE.Mesh(geometry, material(color));
      item.castShadow=Boolean(quality.shadows); item.receiveShadow=true; return item;
    }
    function addBuilding(location) {
      const [x,z] = location.position;
      const group = new THREE.Group(); group.position.set(x,0,z); group.userData.locationId=location.id;
      const scale = location.id === 'plaza' ? .82 : 1;
      const base = mesh(new THREE.CylinderGeometry(.85*scale,1.02*scale,.28,6), shade(location.color,-28)); base.position.y=.18; group.add(base);
      let body;
      if (['tower','clock','observatory','lookout'].includes(location.kind)) {
        body=mesh(new THREE.CylinderGeometry(.55,.76,2.25,7),location.color); body.position.y=1.43;
        const roof=mesh(new THREE.ConeGeometry(.78,.8,7),shade(location.color,-42)); roof.position.y=2.93; group.add(roof);
      } else if (location.kind === 'fountain') {
        body=mesh(new THREE.CylinderGeometry(.18,.32,1.1,8),location.color); body.position.y=.78;
        const water=mesh(new THREE.ConeGeometry(.58,.82,10),0x72b8b1); water.position.y=1.35; water.scale.y=-1; group.add(water);
      } else if (location.kind === 'garden') {
        body=mesh(new THREE.TorusGeometry(.62,.19,5,10),location.color); body.position.y=.72; body.rotation.x=Math.PI/2;
        for(let i=0;i<5;i++){const bloom=mesh(new THREE.IcosahedronGeometry(.18,0),[0xe3a3a8,0xe9cb75,0x9eb3d7][i%3]);bloom.position.set(Math.cos(i*1.26)*.65,.55,Math.sin(i*1.26)*.65);group.add(bloom)}
      } else if (location.kind === 'board') {
        body=mesh(new THREE.BoxGeometry(1.55,1.25,.18),location.color); body.position.y=1.18;
        for(const side of [-.58,.58]){const post=mesh(new THREE.BoxGeometry(.13,1.45,.13),shade(location.color,-45));post.position.set(side,.72,.08);group.add(post)}
      } else {
        body=mesh(new THREE.BoxGeometry(1.55*scale,1.35*scale,1.25*scale),location.color); body.position.y=.95*scale;
        const roof=mesh(new THREE.ConeGeometry(1.22*scale,.82*scale,4),shade(location.color,-42)); roof.position.y=1.9*scale; roof.rotation.y=Math.PI/4; group.add(roof);
        const door=mesh(new THREE.BoxGeometry(.36,.7,.08),0x5f4639);door.position.set(0,.58*scale,.665*scale);group.add(door);
      }
      group.add(body);
      group.traverse(child=>{if(child.isMesh){child.userData.locationId=location.id;interactive.push(child)}});
      const beacon=mesh(new THREE.OctahedronGeometry(.16,0),0xf5d784); beacon.position.y=3.2; beacon.name='beacon'; group.add(beacon);
      world.add(group); locationGroups.set(location.id,group);
    }
    locations.forEach(addBuilding);

    const treeCount = Math.max(8, Math.round(28*(quality.foliage ?? .5)));
    for(let i=0;i<treeCount;i++){
      const angle=(i/treeCount)*Math.PI*2+.12; const radius=12.1+(i%3)*.7;
      const trunk=mesh(new THREE.CylinderGeometry(.09,.13,.55,5),0x665344); trunk.position.set(Math.cos(angle)*radius,.25,Math.sin(angle)*radius); world.add(trunk);
      const crown=mesh(new THREE.ConeGeometry(.4+(i%3)*.08,.95,6),i%2?0x557a58:0x668a5f); crown.position.set(trunk.position.x,.92,trunk.position.z); world.add(crown);
    }
    for(let i=0;i<(quality.particles||0);i++){
      const mote=mesh(new THREE.OctahedronGeometry(.025,0),0xf7e4a6); const angle=(i/quality.particles)*Math.PI*2;
      mote.position.set(Math.cos(angle)*(3+i%7),.8+(i%5)*.5,Math.sin(angle)*(3+i%7)); mote.userData.mote=i; world.add(mote);
    }

    const character = root.CompassoWorldCharacter?.create(THREE, options.character);
    if (character) { character.group.position.set(0,.22,2.4); character.group.userData.groundY=.22; world.add(character.group); }

    const hemi = new THREE.HemisphereLight(0xf5f0df,0x536650,2.45); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff2d2,3.1); sun.position.set(-8,15,6); sun.castShadow=Boolean(quality.shadows);
    sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left=-16;sun.shadow.camera.right=16;sun.shadow.camera.top=16;sun.shadow.camera.bottom=-16; scene.add(sun);
    const fill = new THREE.DirectionalLight(0x91a9c8,.8); fill.position.set(10,5,-10); scene.add(fill);

    function resize() {
      const rect=canvas.getBoundingClientRect(); const width=Math.max(1,Math.round(rect.width)); const height=Math.max(1,Math.round(rect.height));
      if(canvas.width!==Math.round(width*renderer.getPixelRatio())||canvas.height!==Math.round(height*renderer.getPixelRatio())) renderer.setSize(width,height,false);
      const aspect=width/height; const size=10.7; camera.left=-size*aspect;camera.right=size*aspect;camera.top=size;camera.bottom=-size;camera.updateProjectionMatrix();
    }
    function updateMetrics(next={}) {
      metrics=next;
      for(const location of locations){
        const group=locationGroups.get(location.id); if(!group)continue;
        const value=Number(metrics[location.id])||0; const beacon=group.getObjectByName('beacon');
        if(beacon){const pulse=Math.min(1.75,1+Math.log10(value+1)*.25);beacon.scale.setScalar(pulse);beacon.visible=value>0||location.id==='plaza'}
      }
    }
    function moveCharacterTo(locationId, immediate=false) {
      const location=locations.find(item=>item.id===locationId); if(!location||!character)return Promise.resolve(location);
      const target=new THREE.Vector3(location.position[0],.22,location.position[1]+1.15);
      if(immediate||reducedMotion){character.group.position.copy(target);characterMode='idle';return Promise.resolve(location)}
      characterMode='walking';
      return new Promise(resolve=>{move={from:character.group.position.clone(),to:target,start:clock.elapsedTime,duration:.72,resolve:()=>{characterMode='idle';resolve(location)}}});
    }
    function pick(clientX,clientY) {
      const rect=canvas.getBoundingClientRect(); pointer.x=((clientX-rect.left)/rect.width)*2-1;pointer.y=-((clientY-rect.top)/rect.height)*2+1;
      raycaster.setFromCamera(pointer,camera); const hit=raycaster.intersectObjects(interactive,false)[0];
      return hit?.object?.userData?.locationId || null;
    }
    function setCharacterMode(mode) { characterMode=mode||'idle'; }
    function render(frameTime=0) {
      if(disposed)return; frame=requestAnimationFrame(render);
      const interval=reducedMotion?100:quality.id==='economy'?50:quality.id==='balanced'?25:0;
      if(canvas.offsetParent===null||(interval&&frameTime-lastFrame<interval))return;lastFrame=frameTime;resize(); const elapsed=clock.getElapsedTime();
      if(move&&character){const t=Math.min(1,(elapsed-move.start)/move.duration);const eased=1-Math.pow(1-t,3);character.group.position.lerpVectors(move.from,move.to,eased);if(t>=1){const done=move;move=null;done.resolve()}}
      character?.update(elapsed,characterMode,reducedMotion);
      world.children.forEach(item=>{if(item.userData?.mote!=null&&!reducedMotion)item.position.y+=Math.sin(elapsed*1.5+item.userData.mote)*.0007});
      renderer.render(scene,camera);
    }
    function dispose() {
      disposed=true;cancelAnimationFrame(frame);scene.traverse(item=>{item.geometry?.dispose?.();if(Array.isArray(item.material))item.material.forEach(x=>x.dispose?.());else item.material?.dispose?.()});renderer.dispose();
    }
    updateMetrics(metrics); resize(); render();
    return Object.freeze({ renderer, scene, camera, pick, resize, updateMetrics, moveCharacterTo, setCharacterMode, dispose });
  }

  return { create };
});
