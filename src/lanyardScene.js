/**
 * Vanilla JS 3D lanyard card for the profile modal (Three.js only, no React).
 * Exposes window.mountLanyard(container) and window.unmountLanyard().
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const cardGlbUrl = new URL('./assets/lanyard/card.glb', import.meta.url).href;
const lanyardPngUrl = new URL('./assets/lanyard/lanyard.png', import.meta.url).href;

let scene = null;
let camera = null;
let renderer = null;
let animationId = null;
let container = null;
let cardMesh = null;
let ropeMesh = null;
let curve = null;
let curvePoints = [];
let clock = null;
let isDragging = false;
let dragOffset = new THREE.Vector3();
let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let group = null; // group at (0, 4, 0) holding fixed point + rope + card
const CARD_POSITION = new THREE.Vector3(2, 0, 0); // local to group
const ROPE_LENGTH = 2;
const SWAY_AMOUNT = 0.15;
const SWAY_SPEED = 0.8;

function createCardFallback() {
  const g = new THREE.BoxGeometry(0.8, 1.125, 0.02);
  const m = new THREE.MeshStandardMaterial({
    color: 0x1e3a5f,
    metalness: 0.6,
    roughness: 0.4,
  });
  return new THREE.Mesh(g, m);
}

function buildRopeMesh(texture) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  const segments = 32;
  curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.5, 0, 0),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(1.5, 0, 0),
    new THREE.Vector3(2, 0, 0),
  ]);
  curve.curveType = 'chordal';
  const tubeGeom = new THREE.TubeGeometry(curve, segments, 0.03, 8, false);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(tubeGeom, mat);
}

function getRopeEndLocal() {
  if (!cardMesh) return new THREE.Vector3(2, 0, 0);
  return new THREE.Vector3(
    cardMesh.position.x,
    cardMesh.position.y + 1.2,
    cardMesh.position.z + 0.05
  );
}

function updateRopeGeometry() {
  if (!ropeMesh || !curve) return;
  if (ropeMesh.geometry) ropeMesh.geometry.dispose();
  ropeMesh.geometry = new THREE.TubeGeometry(curve, 32, 0.03, 8, false);
}

function init(containerEl) {
  if (!containerEl) return;
  container = containerEl;
  clock = new THREE.Clock();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(2, 4, 7);
  camera.lookAt(2, 4, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setClearColor(0xf1f5f9, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, Math.PI));
  const dir = new THREE.DirectionalLight(0xffffff, 1.5);
  dir.position.set(5, 10, 7);
  scene.add(dir);
  const dir2 = new THREE.DirectionalLight(0xffffff, 0.8);
  dir2.position.set(-3, 4, 5);
  scene.add(dir2);

  group = new THREE.Group();
  group.position.set(0, 4, 0);
  scene.add(group);

  const textureLoader = new THREE.TextureLoader();
  const gltfLoader = new GLTFLoader();

  textureLoader.load(
    lanyardPngUrl,
    (texture) => {
      ropeMesh = buildRopeMesh(texture);
      ropeMesh.position.set(0, 0, 0);
      curve.points[4].copy(getRopeEndLocal());
      group.add(ropeMesh);
    },
    undefined,
    () => {}
  );

  cardMesh = createCardFallback();
  cardMesh.scale.set(2.25, 2.25, 2.25);
  cardMesh.position.copy(CARD_POSITION);
  cardMesh.position.y = -1.2;
  cardMesh.position.z = -0.05;
  cardMesh.userData.draggable = true;
  group.add(cardMesh);

  gltfLoader.load(
    cardGlbUrl,
    (gltf) => {
      const root = gltf.scene;
      const cardNode = root.getObjectByName('card');
      const clipNode = root.getObjectByName('clip');
      const clampNode = root.getObjectByName('clamp');
      if (cardNode && cardNode.geometry) {
        if (cardMesh.geometry) cardMesh.geometry.dispose();
        if (cardMesh.material) cardMesh.material.dispose();
        const mat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.9,
          metalness: 0.8,
          clearcoat: 1,
          clearcoatRoughness: 0.15,
        });
        if (cardNode.material && cardNode.material.map) {
          mat.map = cardNode.material.map;
          mat.map.anisotropy = 16;
        }
        cardMesh.geometry = cardNode.geometry;
        cardMesh.material = mat;
      }
      if (clipNode && clipNode.geometry) {
        const clip = new THREE.Mesh(clipNode.geometry, clipNode.material || new THREE.MeshStandardMaterial({ color: 0x888888 }));
        clip.position.copy(cardMesh.position);
        clip.position.y += 1.2 * 2.25;
        group.add(clip);
      }
      if (clampNode && clampNode.geometry) {
        const clamp = new THREE.Mesh(clampNode.geometry, clampNode.material || new THREE.MeshStandardMaterial({ color: 0x888888 }));
        clamp.position.copy(cardMesh.position);
        clamp.position.y += 1.2 * 2.25;
        group.add(clamp);
      }
    },
    undefined,
    () => {}
  );

  function onResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w <= 0 || h <= 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersectPoint = new THREE.Vector3();

  function getCardWorldPosition() {
    const pos = new THREE.Vector3();
    cardMesh.getWorldPosition(pos);
    return pos;
  }

  function onPointerDown(e) {
    if (!camera || !cardMesh) return;
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const meshes = [cardMesh];
    const hits = raycaster.intersectObjects(meshes, true);
    if (hits.length > 0) {
      isDragging = true;
      cardMesh.getWorldPosition(intersectPoint);
      dragOffset.copy(raycaster.ray.origin).sub(intersectPoint);
      container.style.cursor = 'grabbing';
    }
  }

  function onPointerMove(e) {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    if (isDragging && camera && cardMesh) {
      raycaster.ray.intersectPlane(plane.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 0, 1),
        getCardWorldPosition()
      ), intersectPoint);
      intersectPoint.sub(dragOffset);
      const local = intersectPoint.clone().sub(group.position);
      cardMesh.position.x = Math.max(-1, Math.min(4, local.x));
      cardMesh.position.y = Math.max(-3, Math.min(2, local.y));
      if (curve && curve.points[4]) {
        curve.points[4].copy(getRopeEndLocal());
        updateRopeGeometry();
      }
    } else if (cardMesh) {
      const hits = raycaster.intersectObject(cardMesh, true);
      container.style.cursor = hits.length > 0 ? 'grab' : '';
    }
  }

  function onPointerUp() {
    if (isDragging) {
      isDragging = false;
      container.style.cursor = '';
    }
  }

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointerleave', onPointerUp);
  window.addEventListener('resize', onResize);
  onResize();

  function animate() {
    animationId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (!isDragging && curve && curve.points && curve.points.length >= 5 && ropeMesh) {
      const sway = Math.sin(t * SWAY_SPEED) * SWAY_AMOUNT;
      curve.points[1].y = sway;
      curve.points[2].y = sway * 0.7;
      curve.points[3].y = sway * 0.3;
      curve.points[4].copy(getRopeEndLocal());
      updateRopeGeometry();
    }
    if (renderer && scene && camera) renderer.render(scene, camera);
  }
  animate();
}

function destroy() {
  if (animationId != null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (container && renderer && renderer.domElement) {
    try {
      container.removeChild(renderer.domElement);
    } catch (_) {}
  }
  if (scene) {
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    });
  }
  if (renderer) renderer.dispose();
  scene = null;
  camera = null;
  renderer = null;
  container = null;
  cardMesh = null;
  ropeMesh = null;
  curve = null;
  group = null;
}

window.mountLanyard = init;
window.unmountLanyard = destroy;
window.dispatchEvent(new Event('lanyard-embed-ready'));
