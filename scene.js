import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

const stage = document.querySelector('#hero-stage');
const canvas = document.querySelector('#clay-canvas');

if (stage && canvas) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 1.25, 10.5);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const metal = new THREE.MeshPhysicalMaterial({ color: 0x090b0c, metalness: .92, roughness: .32, clearcoat: .24, clearcoatRoughness: .3 });
  const edgeMetal = new THREE.MeshPhysicalMaterial({ color: 0x202528, metalness: .95, roughness: .23, clearcoat: .3 });
  const keycap = new THREE.MeshPhysicalMaterial({ color: 0x151a1c, metalness: .35, roughness: .42, clearcoat: .18 });
  const keycapAlt = new THREE.MeshPhysicalMaterial({ color: 0x2a3032, metalness: .5, roughness: .34, clearcoat: .2 });
  const accent = new THREE.MeshPhysicalMaterial({ color: 0xd9ff43, emissive: 0x71820b, emissiveIntensity: .42, metalness: .5, roughness: .25 });
  const strip = new THREE.MeshBasicMaterial({ color: 0xd9ff43, transparent: true, opacity: .88 });

  const keyboard = new THREE.Group();
  keyboard.position.set(.2, -.14, 0);
  keyboard.rotation.set(-.28, -.16, .035);
  scene.add(keyboard);
  const add = (geometry, material, position, scale = [1, 1, 1], parent = keyboard) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  add(new THREE.BoxGeometry(6.35, .25, 2.36), metal, [0, 0, 0]);
  add(new THREE.BoxGeometry(6.12, .08, 2.18), edgeMetal, [0, .16, 0]);
  add(new THREE.BoxGeometry(5.91, .045, 2.03), new THREE.MeshPhysicalMaterial({ color: 0x0e1112, metalness: .72, roughness: .46 }), [0, .21, 0]);
  add(new THREE.BoxGeometry(5.6, .026, .024), strip, [0, -.03, 1.18]);
  add(new THREE.BoxGeometry(5.6, .026, .024), strip, [0, -.03, -1.18]);

  const rows = [
    { count: 14, z: -.78, offset: 0 },
    { count: 14, z: -.39, offset: .08 },
    { count: 13, z: 0, offset: .14 },
    { count: 12, z: .4, offset: .2 },
    { count: 9, z: .8, offset: .3 }
  ];
  const keyWidth = .345;
  const keyDepth = .265;
  rows.forEach((row, rowIndex) => {
    const gap = .055;
    const total = row.count * keyWidth + (row.count - 1) * gap;
    for (let col = 0; col < row.count; col += 1) {
      const x = -total / 2 + keyWidth / 2 + col * (keyWidth + gap) + row.offset;
      const highlighted = (rowIndex === 0 && (col === 1 || col === 12)) || (rowIndex === 2 && col === 6);
      const alternate = (rowIndex + col) % 5 === 0;
      add(new THREE.BoxGeometry(keyWidth, .16, keyDepth), highlighted ? accent : (alternate ? keycapAlt : keycap), [x, .32, row.z]);
    }
  });
  add(new THREE.BoxGeometry(2.1, .16, .28), keycapAlt, [.05, .32, .82]);
  add(new THREE.BoxGeometry(.44, .16, .28), keycap, [-2.43, .32, .82]);
  add(new THREE.BoxGeometry(.5, .16, .28), keycap, [2.35, .32, .82]);
  [-2.45, 2.45].forEach((x) => add(new THREE.BoxGeometry(.24, .2, .28), new THREE.MeshPhysicalMaterial({ color: 0x050606, metalness: .4, roughness: .45 }), [x, -.2, -.82]));

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ color: 0x000000, opacity: .58 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.42;
  floor.receiveShadow = true;
  scene.add(floor);
  scene.add(new THREE.HemisphereLight(0x7e858c, 0x020303, 1.45));
  const keyLight = new THREE.DirectionalLight(0xdde6ef, 4.6);
  keyLight.position.set(-4, 7, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0xd9ff43, 12, 9);
  rimLight.position.set(3.7, 1.3, 3.7);
  scene.add(rimLight);
  const fillLight = new THREE.PointLight(0x5c8cff, 7, 10);
  fillLight.position.set(-4, .2, 2);
  scene.add(fillLight);

  const pointer = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  const targetRotation = { x: -.28, y: -.16 };
  let dragging = false;
  let dragStart = null;
  let hovered = false;
  let pointerPulse = 0;
  const raycaster = new THREE.Raycaster();
  const rayPoint = new THREE.Vector2();
  const updatePointer = (event) => {
    const box = stage.getBoundingClientRect();
    pointer.x = ((event.clientX - box.left) / box.width - .5) * 2;
    pointer.y = ((event.clientY - box.top) / box.height - .5) * 2;
    rayPoint.set(pointer.x, -pointer.y);
    raycaster.setFromCamera(rayPoint, camera);
    hovered = raycaster.intersectObjects(keyboard.children, true).length > 0;
    stage.classList.toggle('keyboard-hover', hovered);
    stage.style.setProperty('--mouse-x', `${Math.round((pointer.x + 1) * 50)}%`);
    stage.style.setProperty('--mouse-y', `${Math.round((pointer.y + 1) * 50)}%`);
  };
  stage.addEventListener('pointermove', (event) => {
    updatePointer(event);
    if (!dragging || !dragStart) return;
    targetRotation.y = dragStart.rotationY + (event.clientX - dragStart.x) * .009;
    targetRotation.x = dragStart.rotationX + (event.clientY - dragStart.y) * .007;
  });
  stage.addEventListener('pointerleave', () => { if (!dragging) { pointer.x = 0; pointer.y = 0; stage.classList.remove('keyboard-hover'); } });
  stage.addEventListener('pointerdown', (event) => {
    updatePointer(event);
    if (event.button !== 0 || !hovered) return;
    dragging = true;
    dragStart = { x: event.clientX, y: event.clientY, rotationX: keyboard.rotation.x, rotationY: keyboard.rotation.y };
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('keyboard-dragging');
  });
  stage.addEventListener('pointerup', (event) => {
    if (!dragging) return;
    dragging = false;
    dragStart = null;
    stage.releasePointerCapture?.(event.pointerId);
    stage.classList.remove('keyboard-dragging');
  });
  stage.addEventListener('click', () => { pointerPulse = 1; });

  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const scale = width < 700 ? .72 : width < 1000 ? .88 : 1;
    keyboard.scale.setScalar(scale);
    keyboard.position.x = width < 700 ? .05 : .2;
    keyboard.position.y = width < 700 ? -.02 : -.14;
  };
  new ResizeObserver(resize).observe(stage);
  resize();
  const clock = new THREE.Clock();
  const animate = () => {
    const time = clock.getElapsedTime();
    current.x += (pointer.x - current.x) * .06;
    current.y += (pointer.y - current.y) * .06;
    if (!dragging) {
      targetRotation.y += (current.x * .22 - targetRotation.y) * .035;
      targetRotation.x += (-.28 - current.y * .11 - targetRotation.x) * .035;
    }
    keyboard.rotation.y += (targetRotation.y - keyboard.rotation.y) * (dragging ? .2 : .08);
    keyboard.rotation.x += (targetRotation.x - keyboard.rotation.x) * (dragging ? .2 : .08);
    keyboard.rotation.z += ((current.x * .025) - keyboard.rotation.z) * .05;
    keyboard.position.y += ((window.innerWidth < 700 ? -.02 : -.14) + Math.sin(time * .7) * .045 - keyboard.position.y) * .04;
    rimLight.position.x += (3.7 + current.x * 3 - rimLight.position.x) * .05;
    rimLight.position.y += (1.3 - current.y * 1.5 - rimLight.position.y) * .05;
    pointerPulse = Math.max(0, pointerPulse - .025);
    stage.style.setProperty('--pulse', pointerPulse.toFixed(3));
    renderer.render(scene, camera);
    if (!reducedMotion) requestAnimationFrame(animate);
  };
  animate();
}
