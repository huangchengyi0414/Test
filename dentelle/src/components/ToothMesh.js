import * as THREE from 'three';

// Procedural molar-ish tooth built from a lathe + rounded cusps.
// Returns a Group with the tooth centered at origin, crown facing +Y.
export function createToothMesh({
  enamelColor = 0xfaf0d6,
  cuspCount = 4,
  scale = 1
} = {}) {
  const group = new THREE.Group();

  // Root (tapered cone-ish via LatheGeometry)
  const rootPoints = [];
  const segments = 16;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = -1.8 + t * 1.6; // -1.8 bottom root tip → -0.2 crown base
    let r;
    if (t < 0.2) r = 0.05 + t * 1.4; // root tip
    else if (t < 0.85) r = 0.32 + Math.sin(t * Math.PI) * 0.15;
    else r = 0.55 + (t - 0.85) * 1.3; // flare at crown base
    rootPoints.push(new THREE.Vector2(r, y));
  }
  const rootGeom = new THREE.LatheGeometry(rootPoints, 48);
  const enamelMat = new THREE.MeshPhysicalMaterial({
    color: enamelColor,
    roughness: 0.25,
    metalness: 0.05,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xffe9c4),
    transmission: 0.15,
    thickness: 0.6,
    ior: 1.5
  });
  const root = new THREE.Mesh(rootGeom, enamelMat);
  group.add(root);

  // Crown dome
  const crownGeom = new THREE.SphereGeometry(0.72, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const crown = new THREE.Mesh(crownGeom, enamelMat);
  crown.position.y = -0.2;
  crown.scale.set(1, 0.55, 1);
  group.add(crown);

  // Cusps (rounded bumps on top)
  const cuspGeom = new THREE.SphereGeometry(0.22, 24, 18);
  for (let i = 0; i < cuspCount; i++) {
    const a = (i / cuspCount) * Math.PI * 2 + Math.PI / cuspCount;
    const r = 0.32;
    const cusp = new THREE.Mesh(cuspGeom, enamelMat);
    cusp.position.set(Math.cos(a) * r, 0.18, Math.sin(a) * r);
    cusp.scale.set(1, 0.9, 1);
    group.add(cusp);
  }

  // Subtle center pit
  const pitGeom = new THREE.TorusGeometry(0.18, 0.03, 12, 24);
  const pitMat = new THREE.MeshStandardMaterial({
    color: 0xd8c097,
    roughness: 0.7,
    metalness: 0
  });
  const pit = new THREE.Mesh(pitGeom, pitMat);
  pit.rotation.x = Math.PI / 2;
  pit.position.y = 0.22;
  group.add(pit);

  group.scale.setScalar(scale);
  return group;
}

export function createGumBase({ radius = 1.6 } = {}) {
  const geom = new THREE.CylinderGeometry(radius, radius * 1.15, 0.35, 48, 1);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x6a1b20,
    roughness: 0.55,
    metalness: 0,
    sheen: 0.3,
    sheenColor: new THREE.Color(0xff9aa2)
  });
  const gum = new THREE.Mesh(geom, mat);
  gum.position.y = -2.0;
  return gum;
}
