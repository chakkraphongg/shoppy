/**
 * DEKROYSHOP - Real Full-Body 3D WebGL Model Viewer
 * Powered by Three.js & WebGL | True 360° Interactive Polygonal Mesh Inspection
 */

(function() {
    'use strict';

    let scene = null;
    let camera = null;
    let renderer = null;
    let controls = null;
    let modelGroup = null;
    let currentMesh = null;
    let animFrameId = null;
    let isWireframeActive = false;
    let isAutoRotating = true;
    let currentItemCode = '';
    let currentItemName = '';
    let currentLoadToken = 0;

    const statsEl = document.getElementById('real3dStats');
    const spinner = document.getElementById('real3dSpinner');

    // ==========================================================
    // INITIALIZE THREE.JS 3D SCENE & ENGINE
    // ==========================================================
    function initScene() {
        if (renderer) return; // already initialized

        const targetContainer = document.getElementById('real3dCanvasContainer');
        if (!targetContainer) return;

        const width = targetContainer.clientWidth || 700;
        const height = targetContainer.clientHeight || 550;

        // 1. Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0d14);
        scene.fog = new THREE.FogExp2(0x0a0d14, 0.08);

        // Model Group Container (for clean wiping between models)
        modelGroup = new THREE.Group();
        scene.add(modelGroup);

        // 2. Camera
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 1.15, 3.2);

        // 3. WebGL Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        if (typeof THREE.SRGBColorSpace !== 'undefined') {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
        }
        targetContainer.innerHTML = '';
        targetContainer.appendChild(renderer.domElement);

        // 4. Orbit Controls (Smooth 360 Rotation & Zoom)
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.target.set(0, 0.95, 0); // Focus on torso/chest
            controls.minDistance = 0.6;
            controls.maxDistance = 6.0;
            controls.minPolarAngle = Math.PI / 8; // Don't clip below floor
            controls.maxPolarAngle = Math.PI / 2 + 0.05;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 2.0;
        }

        // 5. Lighting Setup (Professional Gaming Studio Lighting)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        // Key Light (Warm White)
        const keyLight = new THREE.DirectionalLight(0xfff5eb, 1.4);
        keyLight.position.set(4, 8, 5);
        scene.add(keyLight);

        // Fill Light (Cool Blue)
        const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.8);
        fillLight.position.set(-4, 5, -3);
        scene.add(fillLight);

        // Cyber Cyan Rim Light (Backlight highlight)
        const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
        rimLight.position.set(0, 6, -6);
        scene.add(rimLight);

        // 6. 3D Holographic Ground Pedestal & Grid
        createPedestal();

        // 7. Window Resize
        window.addEventListener('resize', onWindowResize);

        // 8. Start Render Loop
        animate();
    }

    // ==========================================================
    // CREATE ILLUMINATED PEDESTAL AT Y = 0
    // ==========================================================
    function createPedestal() {
        // Glowing circular disk
        const diskGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.04, 48);
        const diskMat = new THREE.MeshStandardMaterial({
            color: 0x181c24,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x003344,
            emissiveIntensity: 0.3
        });
        const disk = new THREE.Mesh(diskGeo, diskMat);
        disk.position.y = -0.02;
        scene.add(disk);

        // Glowing ring outline
        const ringGeo = new THREE.RingGeometry(0.88, 0.94, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.002;
        scene.add(ring);

        // Radial Grid Floor
        const grid = new THREE.GridHelper(4, 24, 0x00f0ff, 0x222a38);
        grid.position.y = 0.001;
        scene.add(grid);
    }

    // ==========================================================
    // CLEAR & DISPOSE ALL PREVIOUS MESHES (PREVENTS OVERLAPPING)
    // ==========================================================
    function clearCurrentModel() {
        if (!modelGroup) return;
        while (modelGroup.children.length > 0) {
            const obj = modelGroup.children[0];
            modelGroup.remove(obj);
            if (obj.geometry) {
                obj.geometry.dispose();
            }
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => {
                        if (m.map) m.map.dispose();
                        m.dispose();
                    });
                } else {
                    if (obj.material.map) obj.material.map.dispose();
                    obj.material.dispose();
                }
            }
        }
        currentMesh = null;
    }

    // ==========================================================
    // LOAD & DISPLAY FULL-BODY 3D MODEL & POPULATE SIDEBAR
    // ==========================================================
    window.loadReal3DModel = function(itemCode, itemName, itemId) {
        currentLoadToken++;
        const token = currentLoadToken;

        const item = window.currentModalItem || {};
        currentItemCode = itemCode || item.code || '';
        currentItemName = itemName || item.name || currentItemCode || 'DEKROYSHOP 3D';

        initScene();

        // 1. Immediately wipe any existing model so models never overlap!
        clearCurrentModel();

        // 2. Populate Left Sidebar Details
        const nameEl = document.getElementById('real3dItemName');
        if (nameEl) nameEl.textContent = currentItemName;

        const catBadge = document.getElementById('real3dCategoryBadge');
        const catName = (item.category || item.catSlug || 'HERO').toUpperCase();
        if (catBadge) catBadge.textContent = catName;

        const subType = document.getElementById('real3dSubCategory');
        if (subType) subType.textContent = catName;

        const codeEl = document.getElementById('real3dItemCode');
        if (codeEl) codeEl.textContent = currentItemCode || ('ITM-' + (itemId || item.id || '0'));

        // Price showcase (ปกติ 20 บาท / พิเศษ 15 บาท)
        const priceAmount = document.getElementById('real3dPriceAmount');
        const priceLabel = document.getElementById('real3dPriceLabel');
        const oldPriceWrap = document.getElementById('real3dOldPriceWrap');
        const oldPriceText = document.getElementById('real3dOldPrice');
        const saleBadge = document.getElementById('real3dSaleBadge');

        const price = parseFloat(item.price || '20');
        const origPrice = parseFloat(item.origPrice || '20');
        const isSale = (price < origPrice || price === 15);

        if (priceAmount) priceAmount.textContent = Math.round(price);

        if (isSale) {
            if (priceLabel) {
                priceLabel.textContent = 'พิเศษ';
                priceLabel.style.color = '#facc15';
            }
            if (oldPriceWrap) oldPriceWrap.style.display = 'inline-flex';
            if (oldPriceText) oldPriceText.textContent = `ปกติ 20 บาท`;
            if (saleBadge) {
                saleBadge.style.display = 'inline-block';
                saleBadge.textContent = `🔥 ลดราคา 15.-`;
            }
        } else {
            if (priceLabel) {
                priceLabel.textContent = 'ปกติ';
                priceLabel.style.color = '#facc15';
            }
            if (oldPriceWrap) oldPriceWrap.style.display = 'none';
            if (saleBadge) saleBadge.style.display = 'none';
        }

        // Reset notice
        const notice = document.getElementById('real3dCopyNotice');
        if (notice) notice.style.display = 'none';

        if (statsEl) statsEl.textContent = 'LOADING 3D MESH & TEXTURES...';
        if (spinner) spinner.style.display = 'flex';

        const appUrl = (window.APP_URL || '').replace(/\/$/, '');
        const queryParams = [];
        const effectiveId = itemId || item.id || '';
        if (effectiveId) queryParams.push('id=' + encodeURIComponent(effectiveId));
        if (currentItemCode) queryParams.push('code=' + encodeURIComponent(currentItemCode));

        // 1. Resolve exact static model filename via model index if present
        const modelIndex = window.DEKROY_MODEL_INDEX || {};
        let modelFileName = null;
        if (effectiveId && modelIndex[effectiveId]) {
            modelFileName = modelIndex[effectiveId];
        } else if (currentItemCode && modelIndex[currentItemCode.toLowerCase()]) {
            modelFileName = modelIndex[currentItemCode.toLowerCase()];
        } else if (currentItemCode) {
            const stripped = currentItemCode.toLowerCase().replace(/[_\s]*0*[1-9]$/, '');
            if (modelIndex[stripped]) {
                modelFileName = modelIndex[stripped];
            } else {
                modelFileName = currentItemCode.toLowerCase();
            }
        }

        const staticModelUrl = modelFileName ? ((appUrl ? appUrl + '/' : '') + 'assets/models/' + encodeURIComponent(modelFileName) + '.json') : null;
        const apiUrl = (appUrl ? appUrl + '/' : '') + 'api/get-model.php?' + queryParams.join('&');

        // Prefer static direct fetch if not running on dynamic PHP server
        const isDynamicPhp = window.location.pathname.endsWith('.php') || window.location.pathname.endsWith('/');
        const initialUrl = isDynamicPhp ? apiUrl : (staticModelUrl || apiUrl);
        const secondaryUrl = isDynamicPhp ? staticModelUrl : apiUrl;

        fetch(initialUrl)
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Initial fetch returned ' + res.status);
            })
            .then(data => {
                if (token !== currentLoadToken) return;
                buildMeshFromData(data, token);
                if (spinner) spinner.style.display = 'none';
            })
            .catch(err => {
                console.warn('Initial model load failed, trying secondary URL...', err);
                if (secondaryUrl) {
                    return fetch(secondaryUrl)
                        .then(res => {
                            if (res.ok) return res.json();
                            throw new Error('Secondary model fetch failed');
                        })
                        .then(data => {
                            if (token !== currentLoadToken) return;
                            buildMeshFromData(data, token);
                            if (spinner) spinner.style.display = 'none';
                        });
                }
                throw err;
            })
            .catch(err2 => {
                console.warn('Direct static JSON failed, falling back to base soldier model...', err2);
                const fallbackUrl = (appUrl ? appUrl + '/' : '') + 'assets/models/2002gsg9.json';
                return fetch(fallbackUrl)
                    .then(r => {
                        if (r.ok) return r.json();
                        throw new Error('Fallback model not found');
                    })
                    .then(data => {
                        if (token !== currentLoadToken) return;
                        buildMeshFromData(data, token);
                        if (spinner) spinner.style.display = 'none';
                    });
            })
            .catch(err3 => {
                if (token !== currentLoadToken) return;
                console.warn('Local file security policy (file://) blocked fetch. Generating procedural 3D mesh:', err3);
                buildProceduralFallbackMesh(item);
                if (spinner) spinner.style.display = 'none';
                if (statsEl) {
                    statsEl.textContent = window.location.protocol === 'file:' 
                        ? '3D PREVIEW (แนะนำให้รัน start-server.bat เพื่อโหลด 3D โมเดลเต็ม)' 
                        : '3D PREVIEW ACTIVE';
                }
            });
    };

    // Procedural 3D mesh generator for offline/file:// preview when fetch() is blocked by browser CORS
    function buildProceduralFallbackMesh(item) {
        clearCurrentModel();
        const cat = ((item && (item.catSlug || item.category)) || 'hero').toLowerCase();
        let geom;
        let matColor = 0x00f0ff;

        if (cat === 'weapons') {
            geom = new THREE.BoxGeometry(0.3, 0.45, 1.6);
            matColor = 0xff5500;
        } else if (cat === 'armor') {
            geom = new THREE.CylinderGeometry(0.35, 0.3, 0.9, 16);
            matColor = 0x3b82f6;
        } else if (cat === 'head') {
            geom = new THREE.SphereGeometry(0.4, 24, 24);
            matColor = 0x06b6d4;
        } else if (cat === 'backpack') {
            geom = new THREE.BoxGeometry(0.5, 0.7, 0.35);
            matColor = 0x10b981;
        } else {
            // Hero humanoid
            const group = new THREE.Group();
            const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
            const bodyGeo = new THREE.CylinderGeometry(0.25, 0.2, 0.8, 16);
            const mat = new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                roughness: 0.3,
                metalness: 0.5,
                wireframe: isWireframeActive
            });
            const head = new THREE.Mesh(headGeo, mat);
            head.position.y = 1.45;
            const body = new THREE.Mesh(bodyGeo, mat);
            body.position.y = 0.9;
            group.add(head);
            group.add(body);
            modelGroup.add(group);
            currentMesh = head;
            if (controls) controls.target.set(0, 0.95, 0);
            return;
        }

        const mat = new THREE.MeshStandardMaterial({
            color: matColor,
            roughness: 0.35,
            metalness: 0.6,
            wireframe: isWireframeActive
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.y = 0.9;
        modelGroup.add(mesh);
        currentMesh = mesh;
        if (controls) controls.target.set(0, 0.9, 0);
    }

    function buildMeshFromData(data, token) {
        if (!data || !data.verts || !data.indices) {
            console.error('Invalid 3D mesh data');
            return;
        }
        if (token && token !== currentLoadToken) {
            return; // Abort if stale
        }

        // Ensure previous model is wiped before mounting new mesh
        clearCurrentModel();

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.verts, 3));

        if (data.normals && data.normals.length > 0) {
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(data.normals, 3));
        } else {
            geometry.computeVertexNormals();
        }

        if (data.uvs && data.uvs.length > 0) {
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(data.uvs, 2));
        }

        geometry.setIndex(data.indices);

        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox;
        const height = bbox.max.y - bbox.min.y;
        const width = bbox.max.x - bbox.min.x;
        const depth = bbox.max.z - bbox.min.z;
        const maxDim = Math.max(width, height, depth);

        // Material with texture and authentic tactical coloring
        const appUrl = (window.APP_URL || '').replace(/\/$/, '');
        let material;

        if (data.texture) {
            const texLoader = new THREE.TextureLoader();
            const texturePath = (appUrl ? appUrl + '/' : '') + data.texture.replace(/^\/+/, '');
            
            const tex = texLoader.load(
                texturePath,
                function(loadedTex) {
                    if (token && token !== currentLoadToken) {
                        loadedTex.dispose();
                        return;
                    }
                    loadedTex.wrapS = THREE.RepeatWrapping;
                    loadedTex.wrapT = THREE.RepeatWrapping;
                    loadedTex.needsUpdate = true;
                    if (currentMesh && currentMesh.material) {
                        currentMesh.material.map = loadedTex;
                        currentMesh.material.needsUpdate = true;
                    }
                    if (renderer && scene && camera) renderer.render(scene, camera);
                },
                undefined,
                function(err) {
                    console.warn('Failed to load texture image, using tactical fallback material:', err);
                }
            );
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            if (typeof THREE.SRGBColorSpace !== 'undefined') {
                tex.colorSpace = THREE.SRGBColorSpace;
            }

            material = new THREE.MeshStandardMaterial({
                map: tex,
                color: 0xffffff,
                roughness: 0.45,
                metalness: 0.15,
                wireframe: isWireframeActive,
                flatShading: false
            });
        } else {
            // Category-tailored tactical colors so no model is dull gray
            let hexColor = 0xe2e8f0;
            let roughness = 0.4;
            let metalness = 0.3;
            const cat = (data.category || '').toLowerCase();
            if (cat === 'weapons') {
                hexColor = 0x2e3846;
                roughness = 0.25;
                metalness = 0.8;
            } else if (cat === 'armor') {
                hexColor = 0x3b82f6;
                roughness = 0.35;
                metalness = 0.4;
            } else if (cat === 'hero') {
                hexColor = 0xf59e0b;
                roughness = 0.45;
                metalness = 0.2;
            } else if (cat === 'head') {
                hexColor = 0x06b6d4;
                roughness = 0.35;
                metalness = 0.45;
            } else if (cat === 'set') {
                hexColor = 0xec4899;
                roughness = 0.35;
                metalness = 0.4;
            } else if (cat === 'backpack') {
                hexColor = 0x10b981;
                roughness = 0.55;
                metalness = 0.15;
            }
            material = new THREE.MeshStandardMaterial({
                color: hexColor,
                roughness: roughness,
                metalness: metalness,
                wireframe: isWireframeActive,
                flatShading: false
            });
        }

        currentMesh = new THREE.Mesh(geometry, material);
        currentMesh.castShadow = true;
        currentMesh.receiveShadow = true;
        
        // Add strictly to modelGroup
        modelGroup.add(currentMesh);

        // Update Stats UI
        const vertCount = (data.verts.length / 3).toLocaleString();
        const polyCount = (data.indices.length / 3).toLocaleString();
        const textureStatus = data.texture ? 'TEXTURE READY' : 'TACTICAL SHADING';
        if (statsEl) {
            statsEl.textContent = `${vertCount} VERTS | ${polyCount} POLYS | ${textureStatus}`;
        }

        // Camera Framing (Intelligent positioning for Character vs Weapon vs Gear)
        const isWeapon = (data.category === 'weapons') || (width > 0.45 && height < 0.7);
        if (controls) {
            if (isWeapon) {
                const targetY = 0.45;
                controls.target.set(0, targetY, 0);
                const camDist = Math.max(1.15, maxDim * 1.35);
                camera.position.set(0, targetY + 0.1, camDist);
            } else {
                controls.target.set(0, height * 0.52, 0);
                camera.position.set(0, height * 0.58, Math.max(2.1, height * 1.55));
            }
            controls.update();
        }
    }

    // ==========================================================
    // 1-CLICK COPY SLIP FOR FACEBOOK CHAT
    // ==========================================================
    window.copyReal3dItemSlip = function() {
        const item = window.currentModalItem || {};
        const code = currentItemCode || item.code || 'N/A';
        const name = currentItemName || item.name || 'DEKROYSHOP 3D';
        const price = parseFloat(item.price || '20');
        const origPrice = parseFloat(item.origPrice || '20');
        const isSale = (price < origPrice || price === 15);

        const textToCopy = isSale
            ? `สวัสดีครับ สนใจสั่งซื้อไอเทม: ${name} (รหัส: ${code}) ราคาพิเศษ ${price} บาท (ปกติ 20 บาท) จากเว็บ DEKROYSHOP`
            : `สวัสดีครับ สนใจสั่งซื้อไอเทม: ${name} (รหัส: ${code}) ราคาปกติ 20 บาท จากเว็บ DEKROYSHOP`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showCopyNotice();
            }).catch(() => fallbackCopy(textToCopy));
        } else {
            fallbackCopy(textToCopy);
        }

        function fallbackCopy(txt) {
            const tempInput = document.createElement("textarea");
            tempInput.value = txt;
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                document.execCommand("copy");
                showCopyNotice();
            } catch (e) {
                alert("กรุณาคัดลอกข้อความนี้: " + txt);
            }
            document.body.removeChild(tempInput);
        }

        function showCopyNotice() {
            const notice = document.getElementById('real3dCopyNotice');
            if (notice) {
                notice.style.display = 'block';
                setTimeout(() => {
                    notice.style.display = 'none';
                }, 4000);
            }
        }
    };

    // ==========================================================
    // RENDER ANIMATION LOOP
    // ==========================================================
    function animate() {
        animFrameId = requestAnimationFrame(animate);
        if (controls) controls.update();
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    function onWindowResize() {
        const targetContainer = document.getElementById('real3dCanvasContainer');
        if (!targetContainer || !renderer || !camera) return;
        const width = targetContainer.clientWidth;
        const height = targetContainer.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // ==========================================================
    // MODAL CONTROL & TOGGLES
    // ==========================================================
    window.openFullBody3DModal = function(code, name, id) {
        let item = window.currentModalItem || {};
        const targetId = (typeof id !== 'undefined' && id !== null && id !== '') ? id : (item.id || '');
        
        // Ensure item details are extracted directly from the clicked card
        if (targetId) {
            const card = document.querySelector(`.fn-card[data-id="${targetId}"]`);
            if (card) {
                item = {
                    id: card.dataset.id || targetId,
                    name: card.dataset.name || name,
                    code: card.dataset.code || code,
                    price: parseFloat(card.dataset.price || '20'),
                    origPrice: parseFloat(card.dataset.origPrice || '20'),
                    category: card.dataset.category || 'COSMETIC',
                    catSlug: card.dataset.catSlug || 'hero'
                };
                window.currentModalItem = item;
            }
        }

        const targetCode = code || item.code || '';
        const targetName = name || item.name || 'DEKROYSHOP 3D';

        const real3dModal = document.getElementById('fnReal3dModal');
        if (!real3dModal) return;

        real3dModal.style.display = 'flex';
        real3dModal.classList.add('show');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            onWindowResize();
            window.loadReal3DModel(targetCode, targetName, targetId);
        }, 60);
    };

    window.closeFullBody3DModal = function() {
        // Increment token so any pending fetches are cancelled
        currentLoadToken++;
        clearCurrentModel();

        const real3dModal = document.getElementById('fnReal3dModal');
        if (!real3dModal) return;

        real3dModal.classList.remove('show');
        setTimeout(() => {
            real3dModal.style.display = 'none';
        }, 200);

        // Restore scroll
        document.body.style.overflow = '';
    };

    window.toggle3dWireframe = function() {
        isWireframeActive = !isWireframeActive;
        if (currentMesh && currentMesh.material) {
            currentMesh.material.wireframe = isWireframeActive;
        }
        const btn = document.getElementById('real3dBtnWireframe');
        if (btn) btn.classList.toggle('active', isWireframeActive);
    };

    window.toggle3dAutoSpin = function() {
        isAutoRotating = !isAutoRotating;
        if (controls) controls.autoRotate = isAutoRotating;
        const btn = document.getElementById('real3dBtnSpin');
        if (btn) btn.classList.toggle('active', isAutoRotating);
    };

    window.zoom3dIn = function() {
        if (!controls || !camera) return;
        camera.position.multiplyScalar(0.8);
        controls.update();
    };

    window.zoom3dOut = function() {
        if (!controls || !camera) return;
        camera.position.multiplyScalar(1.25);
        controls.update();
    };

    window.reset3dCamera = function() {
        if (!controls || !camera) return;
        controls.target.set(0, 0.95, 0);
        camera.position.set(0, 1.15, 3.2);
        controls.autoRotate = true;
        isAutoRotating = true;
        const btn = document.getElementById('real3dBtnSpin');
        if (btn) btn.classList.add('active');
        controls.update();
    };
})();
