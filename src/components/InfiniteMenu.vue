<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';

const DEFAULT_ITEMS = [
  {
    image: 'https://picsum.photos/900/900?grayscale',
    link: 'https://google.com/',
    title: '',
    description: ''
  }
];

const props = defineProps({
  items: {
    type: Array,
    default: () => [
      {
        image: 'https://picsum.photos/900/900?grayscale',
        link: 'https://google.com/',
        title: '',
        description: ''
      }
    ]
  },
  scale: {
    type: Number,
    default: 1.0
  }
});

const canvasRef = ref(null);
const activeItem = ref(null);
const isMoving = ref(false);
const resolvedItems = computed(() => (props.items?.length ? props.items : DEFAULT_ITEMS));

let animationId = null;
let infiniteMenu = null;

const discVertShaderSource = `#version 300 es
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;
in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;
out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;
#define PI 3.141593
void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);
    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);
    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }
    worldPosition.xyz = radius * normalize(worldPosition.xyz);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}
`;

const discFragShaderSource = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;
out vec4 outColor;
in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;
void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;
    ivec2 texSize = textureSize(uTex, 0);
    float imageAspect = float(texSize.x) / float(texSize.y);
    float containerAspect = 1.0;
    float scale = max(imageAspect / containerAspect, containerAspect / imageAspect);
    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = (st - 0.5) * scale + 0.5;
    st = clamp(st, 0.0, 1.0);
    st = st * cellSize + cellOffset;
    outColor = texture(uTex, st);
    outColor.a *= vAlpha;
}
`;

// ─── Face ───────────────────────────────────────────────────────────────────
class Face {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
}

// ─── Vertex ─────────────────────────────────────────────────────────────────
class Vertex {
  constructor(position, normal, uv) {
    this.position = position;
    this.normal = normal;
    this.uv = uv;
  }
}

// ─── Geometry ───────────────────────────────────────────────────────────────
class Geometry {
  constructor() {
    this.vertices = [];
    this.faces = [];
  }

  addVertex(vertex) {
    this.vertices.push(vertex);
    return this.vertices.length - 1;
  }

  addFace(face) {
    this.faces.push(face);
  }

  subdivide(depth = 0) {
    let faces = this.faces;
    for (let i = 0; i < depth; i++) {
      const newFaces = [];
      const midPointCache = {};
      for (const face of faces) {
        const ab = this._getMidPoint(face.a, face.b, midPointCache);
        const bc = this._getMidPoint(face.b, face.c, midPointCache);
        const ca = this._getMidPoint(face.c, face.a, midPointCache);
        newFaces.push(new Face(face.a, ab, ca));
        newFaces.push(new Face(face.b, bc, ab));
        newFaces.push(new Face(face.c, ca, bc));
        newFaces.push(new Face(ab, bc, ca));
      }
      faces = newFaces;
    }
    this.faces = faces;
  }

  spherize(radius) {
    for (const vertex of this.vertices) {
      const pos = vertex.position;
      vec3.normalize(pos, pos);
      vec3.scale(pos, pos, radius);
      vec3.copy(vertex.normal, pos);
      vec3.normalize(vertex.normal, vertex.normal);
    }
  }

  _getMidPoint(i1, i2, cache) {
    const key = i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
    if (cache[key] !== undefined) {
      return cache[key];
    }
    const v1 = this.vertices[i1];
    const v2 = this.vertices[i2];
    const midPos = vec3.create();
    vec3.add(midPos, v1.position, v2.position);
    vec3.scale(midPos, midPos, 0.5);
    const midNormal = vec3.create();
    vec3.add(midNormal, v1.normal, v2.normal);
    vec3.normalize(midNormal, midNormal);
    const midUv = vec2.create();
    vec2.add(midUv, v1.uv, v2.uv);
    vec2.scale(midUv, midUv, 0.5);
    const idx = this.addVertex(new Vertex(midPos, midNormal, midUv));
    cache[key] = idx;
    return idx;
  }

  get data() {
    return {
      vertices: this.vertexData,
      normals: this.normalData,
      uvs: this.uvData,
      indices: this.indexData
    };
  }

  get vertexData() {
    const out = new Float32Array(this.vertices.length * 3);
    for (let i = 0; i < this.vertices.length; i++) {
      const p = this.vertices[i].position;
      out[i * 3] = p[0];
      out[i * 3 + 1] = p[1];
      out[i * 3 + 2] = p[2];
    }
    return out;
  }

  get normalData() {
    const out = new Float32Array(this.vertices.length * 3);
    for (let i = 0; i < this.vertices.length; i++) {
      const n = this.vertices[i].normal;
      out[i * 3] = n[0];
      out[i * 3 + 1] = n[1];
      out[i * 3 + 2] = n[2];
    }
    return out;
  }

  get uvData() {
    const out = new Float32Array(this.vertices.length * 2);
    for (let i = 0; i < this.vertices.length; i++) {
      const u = this.vertices[i].uv;
      out[i * 2] = u[0];
      out[i * 2 + 1] = u[1];
    }
    return out;
  }

  get indexData() {
    const out = new Uint16Array(this.faces.length * 3);
    for (let i = 0; i < this.faces.length; i++) {
      const f = this.faces[i];
      out[i * 3] = f.a;
      out[i * 3 + 1] = f.b;
      out[i * 3 + 2] = f.c;
    }
    return out;
  }
}

// ─── IcosahedronGeometry ────────────────────────────────────────────────────
class IcosahedronGeometry extends Geometry {
  constructor() {
    super();
    const t = (1 + Math.sqrt(5)) / 2;
    const verts = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];
    for (const v of verts) {
      const pos = vec3.fromValues(v[0], v[1], v[2]);
      const normal = vec3.create();
      vec3.normalize(normal, pos);
      this.addVertex(new Vertex(pos, normal, vec2.fromValues(0, 0)));
    }
    const tris = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];
    for (const t of tris) {
      this.addFace(new Face(t[0], t[1], t[2]));
    }
    this._generateUVs();
  }

  _generateUVs() {
    for (let i = 0; i < this.vertices.length; i++) {
      const pos = this.vertices[i].position;
      const n = vec3.create();
      vec3.normalize(n, pos);
      const u = 0.5 + Math.atan2(n[2], n[0]) / (2 * Math.PI);
      const v = 0.5 - Math.asin(n[1]) / Math.PI;
      this.vertices[i].uv = vec2.fromValues(u, v);
    }
  }
}

// ─── DiscGeometry ───────────────────────────────────────────────────────────
class DiscGeometry extends Geometry {
  constructor(steps = 4, radius = 1) {
    super();
    const angleStep = (2 * Math.PI) / steps;
    this.addVertex(new Vertex(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1), vec2.fromValues(0.5, 0.5)));
    for (let i = 0; i < steps; i++) {
      const angle = i * angleStep;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const u = (Math.cos(angle) + 1) * 0.5;
      const v = (Math.sin(angle) + 1) * 0.5;
      this.addVertex(new Vertex(vec3.fromValues(x, y, 0), vec3.fromValues(0, 0, 1), vec2.fromValues(u, v)));
    }
    for (let i = 0; i < steps; i++) {
      const next = (i % steps) + 1;
      this.addFace(new Face(0, i + 1, next === steps ? 1 : next + 1));
    }
  }
}

// ─── Helper functions ───────────────────────────────────────────────────────
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertSource, fragSource) {
  const vertShader = createShader(gl, gl.VERTEX_SHADER, vertSource);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragSource);
  if (!vertShader || !fragShader) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function makeVertexArray(gl, program, buffers) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  for (const buf of buffers) {
    const loc = gl.getAttribLocation(program, buf.name);
    if (loc === -1) continue;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.buffer);
    const numComponents = buf.numComponents || 3;
    const type = buf.type || gl.FLOAT;
    const normalize = buf.normalize || false;
    const stride = buf.stride || 0;
    const offset = buf.offset || 0;
    if (buf.instanced) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, numComponents, type, normalize, stride, offset);
      gl.vertexAttribDivisor(loc, 1);
    } else {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, numComponents, type, normalize, stride, offset);
    }
  }
  gl.bindVertexArray(null);
  return vao;
}

function resizeCanvasToDisplaySize(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth * dpr | 0;
  const h = canvas.clientHeight * dpr | 0;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    return true;
  }
  return false;
}

function makeBuffer(gl, data, usage) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, usage || gl.STATIC_DRAW);
  return buffer;
}

function createAndSetupTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

// ─── ArcballControl ─────────────────────────────────────────────────────────
class ArcballControl {
  constructor(canvas) {
    this.canvas = canvas;
    this.isDragging = false;
    this.previousMouse = vec2.create();
    this.currentMouse = vec2.create();
    this.rotationVelocity = 0;
    this.rotationAxis = vec3.fromValues(0, 1, 0);
    this.rotationQuaternion = quat.create();
    this.tempQuaternion = quat.create();
    this.currentQuaternion = quat.create();
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    canvas.addEventListener('mousedown', this._onMouseDown);
    canvas.addEventListener('mousemove', this._onMouseMove);
    canvas.addEventListener('mouseup', this._onMouseUp);
    canvas.addEventListener('mouseleave', this._onMouseUp);
    canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this._onTouchEnd);
  }

  _getCanvasRelativeMouse(event) {
    const rect = this.canvas.getBoundingClientRect();
    return vec2.fromValues(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );
  }

  _mapToSphere(mouse) {
    const x = mouse[0];
    const y = mouse[1];
    const lengthSq = x * x + y * y;
    const z = lengthSq <= 1 ? Math.sqrt(1 - lengthSq) : 0;
    const result = vec3.fromValues(x, y, z);
    vec3.normalize(result, result);
    return result;
  }

  _onMouseDown(event) {
    event.preventDefault();
    this.isDragging = true;
    vec2.copy(this.previousMouse, this._getCanvasRelativeMouse(event));
  }

  _onMouseMove(event) {
    if (!this.isDragging) return;
    vec2.copy(this.currentMouse, this._getCanvasRelativeMouse(event));
    this._updateRotation();
    vec2.copy(this.previousMouse, this.currentMouse);
  }

  _onMouseUp() {
    this.isDragging = false;
  }

  _onTouchStart(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
      this.isDragging = true;
      vec2.copy(this.previousMouse, this._getCanvasRelativeMouse(event.touches[0]));
    }
  }

  _onTouchMove(event) {
    event.preventDefault();
    if (!this.isDragging || event.touches.length !== 1) return;
    vec2.copy(this.currentMouse, this._getCanvasRelativeMouse(event.touches[0]));
    this._updateRotation();
    vec2.copy(this.previousMouse, this.currentMouse);
  }

  _onTouchEnd() {
    this.isDragging = false;
  }

  _updateRotation() {
    const prevSphere = this._mapToSphere(this.previousMouse);
    const currSphere = this._mapToSphere(this.currentMouse);
    const axis = vec3.create();
    vec3.cross(axis, prevSphere, currSphere);
    const axisLen = vec3.length(axis);
    if (axisLen < 1e-6) return;
    vec3.normalize(axis, axis);
    const dot = vec3.dot(prevSphere, currSphere);
    const angle = Math.acos(Math.min(1, Math.max(-1, dot)));
    quat.setAxisAngle(this.tempQuaternion, axis, angle);
    quat.multiply(this.rotationQuaternion, this.tempQuaternion, this.rotationQuaternion);
    this.rotationVelocity = angle * 0.5;
    vec3.copy(this.rotationAxis, axis);
  }

  update() {
    if (!this.isDragging) {
      this.rotationVelocity *= 0.95;
      if (this.rotationVelocity > 0.001) {
        quat.setAxisAngle(this.tempQuaternion, this.rotationAxis, this.rotationVelocity * 0.02);
        quat.multiply(this.rotationQuaternion, this.tempQuaternion, this.rotationQuaternion);
      }
    }
    quat.copy(this.currentQuaternion, this.rotationQuaternion);
  }

  getMatrix() {
    const m = mat4.create();
    mat4.fromQuat(m, this.currentQuaternion);
    return m;
  }

  destroy() {
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mouseup', this._onMouseUp);
    this.canvas.removeEventListener('mouseleave', this._onMouseUp);
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    this.canvas.removeEventListener('touchmove', this._onTouchMove);
    this.canvas.removeEventListener('touchend', this._onTouchEnd);
  }
}

// ─── InfiniteGridMenu ───────────────────────────────────────────────────────
class InfiniteGridMenu {
  constructor(canvas, items, scale) {
    this.canvas = canvas;
    this.items = items;
    this.scale = scale || 1.0;
    this.gl = canvas.getContext('webgl2', { antialias: true, alpha: true });
    if (!this.gl) {
      console.error('WebGL2 not supported');
      return;
    }
    this.program = createProgram(this.gl, discVertShaderSource, discFragShaderSource);
    if (!this.program) return;
    this.worldMatrixLocation = this.gl.getUniformLocation(this.program, 'uWorldMatrix');
    this.viewMatrixLocation = this.gl.getUniformLocation(this.program, 'uViewMatrix');
    this.projectionMatrixLocation = this.gl.getUniformLocation(this.program, 'uProjectionMatrix');
    this.cameraPositionLocation = this.gl.getUniformLocation(this.program, 'uCameraPosition');
    this.rotationAxisVelocityLocation = this.gl.getUniformLocation(this.program, 'uRotationAxisVelocity');
    this.texLocation = this.gl.getUniformLocation(this.program, 'uTex');
    this.itemCountLocation = this.gl.getUniformLocation(this.program, 'uItemCount');
    this.atlasSizeLocation = this.gl.getUniformLocation(this.program, 'uAtlasSize');
    this.control = new ArcballControl(canvas);
    this.worldMatrix = mat4.create();
    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.cameraPosition = vec3.fromValues(0, 0, 5);
    this._buildGeometry();
    this._buildTextureAtlas().then(() => {
      this._setupBuffers();
    });
  }

  _buildGeometry() {
    const ico = new IcosahedronGeometry();
    ico.subdivide(3);
    ico.spherize(2.0);
    this.sphereVertexCount = ico.faces.length * 3;
    const disc = new DiscGeometry(48, 0.18 * this.scale);
    this.instanceCount = ico.vertices.length;
    this.sphereVertexData = ico.vertexData;
    this.sphereNormalData = ico.normalData;
    this.sphereUvData = ico.uvData;
    this.sphereIndexData = ico.indexData;
    const instanceMatrices = new Float32Array(this.instanceCount * 16);
    for (let i = 0; i < this.instanceCount; i++) {
      const v = ico.vertices[i].position;
      const n = ico.vertices[i].normal;
      const m = mat4.create();
      mat4.translate(m, m, v);
      const zAxis = vec3.fromValues(0, 0, 1);
      const rotAxis = vec3.create();
      vec3.cross(rotAxis, zAxis, n);
      const dotVal = vec3.dot(zAxis, n);
      const angle = Math.acos(Math.min(1, Math.max(-1, dotVal)));
      if (vec3.length(rotAxis) > 1e-6) {
        mat4.rotate(m, m, angle, rotAxis);
      }
      instanceMatrices.set(m, i * 16);
    }
    this.instanceMatrixData = instanceMatrices;
    this.discVertexData = disc.vertexData;
    this.discNormalData = disc.normalData;
    this.discUvData = disc.uvData;
    this.discIndexData = disc.indexData;
    this.discVertexCount = disc.faces.length * 3;
  }

  async _buildTextureAtlas() {
    const gl = this.gl;
    const count = this.items.length;
    const atlasSide = Math.ceil(Math.sqrt(count));
    this.atlasSize = atlasSide;
    const cellSize = 512;
    const canvas = document.createElement('canvas');
    canvas.width = atlasSide * cellSize;
    canvas.height = atlasSide * cellSize;
    const ctx = canvas.getContext('2d');
    const promises = this.items.map((item, i) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const cellX = (i % atlasSide) * cellSize;
          const cellY = Math.floor(i / atlasSide) * cellSize;
          const aspect = img.width / img.height;
          let dw, dh, dx, dy;
          if (aspect > 1) {
            dh = cellSize;
            dw = cellSize * aspect;
            dx = cellX + (cellSize - dw) / 2;
            dy = cellY;
          } else {
            dw = cellSize;
            dh = cellSize / aspect;
            dx = cellX;
            dy = cellY + (cellSize - dh) / 2;
          }
          ctx.drawImage(img, dx, dy, dw, dh);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = item.image;
      });
    });
    await Promise.all(promises);
    this.texture = createAndSetupTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  _setupBuffers() {
    const gl = this.gl;
    this.sphereVao = gl.createVertexArray();
    gl.bindVertexArray(this.sphereVao);
    const spherePosBuf = makeBuffer(gl, this.sphereVertexData);
    const sphereNormBuf = makeBuffer(gl, this.sphereNormalData);
    const sphereUvBuf = makeBuffer(gl, this.sphereUvData);
    const sphereIdxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.sphereIndexData, gl.STATIC_DRAW);
    let loc;
    loc = gl.getAttribLocation(this.program, 'aModelPosition');
    if (loc !== -1) { gl.bindBuffer(gl.ARRAY_BUFFER, spherePosBuf); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0); }
    loc = gl.getAttribLocation(this.program, 'aModelNormal');
    if (loc !== -1) { gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormBuf); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0); }
    loc = gl.getAttribLocation(this.program, 'aModelUvs');
    if (loc !== -1) { gl.bindBuffer(gl.ARRAY_BUFFER, sphereUvBuf); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0); }
    const instBuf = makeBuffer(gl, this.instanceMatrixData, gl.DYNAMIC_DRAW);
    const matLoc0 = gl.getAttribLocation(this.program, 'aInstanceMatrix');
    if (matLoc0 !== -1) {
      for (let i = 0; i < 4; i++) {
        const matLoc = matLoc0 + i;
        gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
        gl.enableVertexAttribArray(matLoc);
        gl.vertexAttribPointer(matLoc, 4, gl.FLOAT, false, 64, i * 16);
        gl.vertexAttribDivisor(matLoc, 1);
      }
    }
    gl.bindVertexArray(null);
    this.spherePosBuf = spherePosBuf;
    this.sphereNormBuf = sphereNormBuf;
    this.sphereUvBuf = sphereUvBuf;
    this.sphereIdxBuf = sphereIdxBuf;
    this.instBuf = instBuf;
  }

  updateInstanceMatrices() {
    const gl = this.gl;
    const rotMat = this.control.getMatrix();
    const newInstanceData = new Float32Array(this.instanceCount * 16);
    for (let i = 0; i < this.instanceCount; i++) {
      const origMat = mat4.create();
      mat4.copy(origMat, this.instanceMatrixData.subarray(i * 16, i * 16 + 16));
      const result = mat4.create();
      mat4.multiply(result, rotMat, origMat);
      newInstanceData.set(result, i * 16);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, newInstanceData);
  }

  render() {
    const gl = this.gl;
    if (!this.program) return;
    resizeCanvasToDisplaySize(this.canvas);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.program);
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    mat4.perspective(this.projectionMatrix, Math.PI / 4, aspect, 0.1, 100);
    mat4.lookAt(this.viewMatrix, this.cameraPosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
    mat4.identity(this.worldMatrix);
    this.control.update();
    this.updateInstanceMatrices();
    gl.uniformMatrix4fv(this.worldMatrixLocation, false, this.worldMatrix);
    gl.uniformMatrix4fv(this.viewMatrixLocation, false, this.viewMatrix);
    gl.uniformMatrix4fv(this.projectionMatrixLocation, false, this.projectionMatrix);
    gl.uniform3fv(this.cameraPositionLocation, this.cameraPosition);
    const rotAxis = this.control.rotationAxis;
    const rotVel = this.control.rotationVelocity;
    gl.uniform4f(this.rotationAxisVelocityLocation, rotAxis[0], rotAxis[1], rotAxis[2], rotVel);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.texLocation, 0);
    gl.uniform1i(this.itemCountLocation, this.items.length);
    gl.uniform1i(this.atlasSizeLocation, this.atlasSize);
    gl.bindVertexArray(this.sphereVao);
    gl.drawElementsInstanced(gl.TRIANGLES, this.sphereVertexCount, gl.UNSIGNED_SHORT, 0, this.instanceCount);
    gl.bindVertexArray(null);
  }

  getActiveItem(normalizedX, normalizedY) {
    return null;
  }

  destroy() {
    if (this.control) {
      this.control.destroy();
    }
  }
}

// ─── Button handler ─────────────────────────────────────────────────────────
function handleButtonClick() {
  if (activeItem.value?.link) {
    window.open(activeItem.value.link, '_blank');
  }
}

// ─── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  if (!canvasRef.value) return;
  infiniteMenu = new InfiniteGridMenu(canvasRef.value, resolvedItems.value, props.scale);

  function animate() {
    if (infiniteMenu) {
      infiniteMenu.render();
    }
    animationId = requestAnimationFrame(animate);
  }
  animate();
});

onBeforeUnmount(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
  if (infiniteMenu) {
    infiniteMenu.destroy();
  }
});

watch(resolvedItems, (newItems) => {
  if (infiniteMenu) {
    infiniteMenu.destroy();
  }
  if (canvasRef.value) {
    infiniteMenu = new InfiniteGridMenu(canvasRef.value, newItems, props.scale);
  }
});

watch(() => props.scale, (newScale) => {
  if (infiniteMenu) {
    infiniteMenu.destroy();
  }
  if (canvasRef.value) {
    infiniteMenu = new InfiniteGridMenu(canvasRef.value, resolvedItems.value, newScale);
  }
});
</script>

<template>
  <div class="infinite-menu-container">
    <canvas ref="canvasRef" class="infinite-menu-canvas" />

    <template v-if="activeItem">
      <h2 class="infinite-menu-title" :class="{ hidden: isMoving }">
        {{ activeItem.title }}
      </h2>
      <p class="infinite-menu-desc" :class="{ hidden: isMoving }">
        {{ activeItem.description }}
      </p>
      <div
        v-if="activeItem.link"
        @click="handleButtonClick"
        class="infinite-menu-button"
        :class="{ hidden: isMoving }"
      >
        <span>View Project</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.infinite-menu-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.infinite-menu-canvas {
  outline: none;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
}

.infinite-menu-canvas:active {
  cursor: grabbing;
}

.infinite-menu-title {
  position: absolute;
  left: 1.6em;
  top: 50%;
  transform: translate(20%, -50%);
  color: white;
  font-size: 3rem;
  font-weight: 900;
  user-select: none;
  transition: opacity 0.5s;
  pointer-events: none;
}

.infinite-menu-desc {
  position: absolute;
  right: 1%;
  top: 50%;
  transform: translate(-90%, -50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.25rem;
  max-width: 10ch;
  user-select: none;
  transition: opacity 0.5s;
  pointer-events: none;
}

.infinite-menu-button {
  position: absolute;
  left: 50%;
  bottom: 2em;
  transform: translateX(-50%);
  background: #9333ea;
  color: white;
  padding: 0.75em 2em;
  border-radius: 9999px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.5s;
}

.infinite-menu-button:hover {
  background: #7c3aed;
}

.hidden {
  opacity: 0;
  pointer-events: none;
}
</style>
