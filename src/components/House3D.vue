src/components/House3D.vue
<template>
  <div class="scene-wrapper">
    <div ref="container" class="house-container"></div>
  </div>
    <DeviceModal
      v-if="isModalVisible"
      :isVisible="isModalVisible"
      @close="isModalVisible = false"
      :sensorData="sensorData"
    />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, shallowRef } from 'vue';
import * as THREE from 'three';
import DeviceModal from './DeviceModal.vue';
import { useDeviceStore } from '../stores/useDeviceStore';

let base: THREE.Mesh;

export default defineComponent({
  name: 'House3D',
  components: { DeviceModal },
  props: {
    isDarkTheme: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const container = ref<HTMLElement | null>(null);
    const isModalVisible = ref(false);
    const isMobile = ref(window.innerWidth <= 768);
    const sceneScale = ref(isMobile.value ? 0.7 : 1.0); // Масштаб 70% для мобильных
   
    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768;
      sceneScale.value = isMobile.value ? 0.7 : 1.0;
      
      if (houseGroup.value) {
        houseGroup.value.scale.set(sceneScale.value, sceneScale.value, sceneScale.value);
      }
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const sensorData = ref({
      timestamp: new Date(),
      temperature: 25,
      humidity: 60
    });

    const touchStartX = ref(0);
    const touchStartY = ref(0);
    const isTouching = ref(false);

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;

    const mouseX = ref(0);
    const mouseY = ref(0);
    const isMouseDown = ref(false);

    let lampLight: THREE.PointLight | null = null;
    let fanBlades: THREE.Group | null = null;
    const rotationSpeed = ref(0);

    const houseGroup = shallowRef<THREE.Group | null>(null);
    const houseHeight = 4;
    const room1 = shallowRef<THREE.Group | null>(null);
    const room2 = shallowRef<THREE.Group | null>(null);

    const deviceStore = useDeviceStore();

    const FAN_SPEEDS = {
      OFF: 0,
      LOW: 0.03,
      MEDIUM: 0.07,
      HIGH: 0.12
    };

    const markNonReactive = (obj: THREE.Object3D) => {
      Object.defineProperty(obj, '__v_skip', { value: true, enumerable: false });
      return obj;
    };

    const getFanSpeed = (temp: number): number => {
      if (!deviceStore.fanIsOn) return FAN_SPEEDS.OFF;
      if (temp < 17) return FAN_SPEEDS.LOW;
      if (temp <= 25) return FAN_SPEEDS.MEDIUM;
      return FAN_SPEEDS.HIGH;
    };

    const updateFanSpeed = () => {
      rotationSpeed.value = getFanSpeed(deviceStore.temperature);
    };

    const createLamp = () => {
      const baseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 32);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: deviceStore.isLampOn ? 1 : 0,
      });
      base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 1.25, 0);

      const lampLight: THREE.PointLight = new THREE.PointLight(0xffff00, 7, 70);
      lampLight.position.set(0, 2.5, 0);
      lampLight.castShadow = true;
      lampLight.visible = deviceStore.isLampOn;

      const lampGroup = new THREE.Group();
      lampGroup.add(base);
      lampGroup.add(lampLight);
      lampGroup.position.set(-2.5, -2, -2.5);

      return { lampGroup, lampLight, baseMaterial };
    };

    watch(
      () => [deviceStore.fanIsOn, deviceStore.temperature],
      () => {
        updateFanSpeed();
      },
      { immediate: true }
    );

    const createFan = (houseHeight: number, houseGroup: THREE.Group): THREE.Group => {
      const fanGroup: THREE.Group = new THREE.Group();

      const baseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32);
      const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
      const base = markNonReactive(new THREE.Mesh(baseGeometry, baseMaterial));
      base.position.set(0, 0, 0);
      fanGroup.add(base);

      const bladesGroup = markNonReactive(new THREE.Group());
      const bladeGeometry = new THREE.BoxGeometry(1.5, 0.05, 0.2);
      const bladeMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });

      for (let i = 0; i < 3; i++) {
        const blade = markNonReactive(new THREE.Mesh(bladeGeometry, bladeMaterial));
        blade.position.set(0, -0.2, 0);
        blade.rotation.y = (i * Math.PI * 2) / 3;
        bladesGroup.add(blade);
      }

      fanGroup.add(bladesGroup);
      fanGroup.position.set(0, houseHeight / 2 - 0.1, 0);
      houseGroup.add(fanGroup);

      const animateBlades = () => {
        requestAnimationFrame(animateBlades);
        if (bladesGroup) {
          bladesGroup.rotation.y += rotationSpeed.value;
        }
      };
      animateBlades();

      return fanGroup;
    };

    const applyTheme = (isDark: boolean) => {
      scene.background = new THREE.Color(isDark ? 0x121212 : 0xf0f0f0);
      if (!houseGroup.value) return;
      const houseGroupObj = houseGroup.value;
      const wallMaterial = houseGroupObj.children
        .filter((child) => child instanceof THREE.Mesh)
        .map((mesh) => (mesh as THREE.Mesh).material)
        .find((material) => material instanceof THREE.MeshPhongMaterial);

      if (wallMaterial && wallMaterial instanceof THREE.MeshPhongMaterial) {
        wallMaterial.color.set(isDark ? 0x444444 : 0x326c96);
      }

      const floorObject = houseGroupObj.children
        .find((child) => child.position.y === -houseHeight / 2 + 0.2 / 2);

      const floorMaterial = floorObject instanceof THREE.Mesh
        ? (floorObject.material as THREE.MeshPhongMaterial | undefined)
        : undefined;

      if (floorMaterial) {
        floorMaterial.color.set(isDark ? 0x333333 : 0x573815);
      }

      if (room1.value && room2.value) {
        const room1Obj = room1.value;
        const room2Obj = room2.value;
        const roomMaterials = [
          ...room1Obj.children.map((child) => {
            if (child instanceof THREE.Mesh) {
              return child.material as THREE.MeshPhongMaterial;
            }
            return null;
          }),
          ...room2Obj.children.map((child) => {
            if (child instanceof THREE.Mesh) {
              return child.material as THREE.MeshPhongMaterial;
            }
            return null;
          }),
        ].filter((material): material is THREE.MeshPhongMaterial => material instanceof THREE.MeshPhongMaterial);

        roomMaterials.forEach((material) => {
          if (material instanceof THREE.MeshPhongMaterial) {
            material.color.set(isDark ? 0x555555 : material.color);
          }
        });
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!container.value?.contains(event.target as Node)) return;
      
      isTouching.value = true;
      touchStartX.value = event.touches[0].clientX;
      touchStartY.value = event.touches[0].clientY;
      event.preventDefault();
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isTouching.value || !houseGroup.value) return;
      
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;
      
      const deltaX = touchX - touchStartX.value;
      const deltaY = touchY - touchStartY.value;
      
      houseGroup.value.rotation.y += deltaX * 0.01;
      houseGroup.value.rotation.x += deltaY * 0.01;
      
      touchStartX.value = touchX;
      touchStartY.value = touchY;
      event.preventDefault();
    };

    const onTouchEnd = () => {
      isTouching.value = false;
    };

    onMounted(() => {
      scene = new THREE.Scene();
      applyTheme(props.isDarkTheme);
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
      renderer = new THREE.WebGLRenderer({ antialias: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      if (container.value) {
        container.value.appendChild(renderer.domElement);
      }

      const ambientLight = markNonReactive(new THREE.AmbientLight(0x404040));
      scene.add(ambientLight);

      const { lampGroup, lampLight: createdLampLight, baseMaterial } = createLamp();
      lampLight = createdLampLight;

      const newHouseGroup = markNonReactive(new THREE.Group()) as THREE.Group;
      newHouseGroup.add(lampGroup);
      houseGroup.value = newHouseGroup;

      const houseWidth = 6;
      const houseDepth = 6;
      const wallThickness = 0.2;

      const wallMaterial = new THREE.MeshPhongMaterial({
        color: 0x326c96,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });

      const floorMaterial = new THREE.MeshPhongMaterial({
        color: 0x573815,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });

      const createWall = (
        width: number,
        height: number,
        depth: number,
        position: { x: number; y: number; z: number },
        material: THREE.Material
      ) => {
        const wallGeometry = new THREE.BoxGeometry(width, height, depth);
        const wall = markNonReactive(new THREE.Mesh(wallGeometry, material));
        wall.position.set(position.x, position.y, position.z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        return wall;
      };

      const houseGroupObj = houseGroup.value;
      houseGroupObj.add(createWall(houseWidth, houseHeight, wallThickness, { x: 0, y: 0, z: houseDepth / 2 - wallThickness / 2 }, wallMaterial));
      houseGroupObj.add(createWall(houseWidth, houseHeight, wallThickness, { x: 0, y: 0, z: -houseDepth / 2 + wallThickness / 2 }, wallMaterial));
      houseGroupObj.add(createWall(wallThickness, houseHeight, houseDepth, { x: -houseWidth / 2 + wallThickness / 2, y: 0, z: 0 }, wallMaterial));
      houseGroupObj.add(createWall(wallThickness, houseHeight, houseDepth, { x: houseWidth / 2 - wallThickness / 2, y: 0, z: 0 }, wallMaterial));
      houseGroupObj.add(createWall(houseWidth, wallThickness, houseDepth, { x: 0, y: -houseHeight / 2 + wallThickness / 2, z: 0 }, floorMaterial));

      const ceilingGeometry = new THREE.PlaneGeometry(houseWidth, houseDepth);
      const ceilingMaterial = new THREE.MeshBasicMaterial({ visible: false });
      const ceiling = markNonReactive(new THREE.Mesh(ceilingGeometry, ceilingMaterial));
      ceiling.position.set(0, houseHeight / 2 - wallThickness / 2, 0);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.raycast = () => {};
      houseGroupObj.add(ceiling);

      houseGroupObj.position.set(0, 0, 0);
      scene.add(houseGroupObj);

      const createRoom = (color: number, position: { x: number; y: number; z: number }) => {
        const roomGroup = markNonReactive(new THREE.Group());
        const roomWidth = 2;
        const roomHeight = houseHeight - wallThickness;
        const roomDepth = 4;

        const createWall = (width: number, height: number, depth: number, pos: { x: number; y: number; z: number }) => {
          const wallGeometry = new THREE.BoxGeometry(width, height, depth);
          const wallMaterial = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.7 });
          const wall = markNonReactive(new THREE.Mesh(wallGeometry, wallMaterial));
          wall.position.set(pos.x, pos.y, pos.z);
          wall.castShadow = true;
          wall.receiveShadow = true;
          return wall;
        };

        roomGroup.add(createWall(roomWidth, roomHeight, wallThickness, { x: 0, y: 0, z: roomDepth / 2 - wallThickness / 2 }));
        roomGroup.add(createWall(roomWidth, roomHeight, wallThickness, { x: 0, y: 0, z: -roomDepth / 2 + wallThickness / 2 }));
        roomGroup.add(createWall(wallThickness, roomHeight, roomDepth, { x: -roomWidth / 2 + wallThickness / 2, y: 0, z: 0 }));
        roomGroup.add(createWall(wallThickness, roomHeight, roomDepth, { x: roomWidth / 2 - wallThickness / 2, y: 0, z: 0 }));

        roomGroup.position.set(
          position.x,
          -houseHeight / 2 + wallThickness + roomHeight / 2,
          position.z
        );
        return roomGroup;
      };

      room1.value = createRoom(0x967532, { 
        x: -houseWidth / 2 + wallThickness / 2 + 1, 
        y: 0, 
        z: houseDepth / 2 - wallThickness / 2 - 2 
      }) as THREE.Group;

      room2.value = createRoom(0x944026, { 
        x: houseWidth / 2 - wallThickness / 2 - 1, 
        y: 0, 
        z: houseDepth / 2 - wallThickness / 2 - 2 
      }) as THREE.Group;
      
      houseGroupObj.add(room1.value);
      houseGroupObj.add(room2.value);

      fanBlades = createFan(houseHeight, houseGroupObj);

      camera.position.z = isMobile.value ? 12 : 8;

      if (isMobile.value && houseGroup.value) {
        houseGroup.value.scale.set(0.8, 0.8, 0.8); 
}

      const houseContainer = container.value;
      const onMouseDown = (event: MouseEvent) => {
        if (houseContainer?.contains(event.target as Node)) {
          isMouseDown.value = true;
        }
      };
      const onMouseUp = () => { isMouseDown.value = false; };
      const onMouseMove = (event: MouseEvent) => {
        if (isMouseDown.value && houseContainer?.contains(event.target as Node)) {
          mouseX.value = (event.clientX / window.innerWidth) * 2 - 1;
          mouseY.value = -(event.clientY / window.innerHeight) * 2 + 1;
        }
      };

      window.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);

      window.addEventListener('touchstart', onTouchStart);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);

      window.addEventListener('resize', handleResize);

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
          const clickedObject = intersects[0].object;
          
          const findRoomParent = (obj: THREE.Object3D): THREE.Group | null => {
            if (!obj.parent) return null;
            if (obj.parent === room1.value || obj.parent === room2.value) return obj.parent as THREE.Group;
            return findRoomParent(obj.parent);
          };

          const roomParent = findRoomParent(clickedObject);
          
          if (roomParent === room1.value || roomParent === room2.value) {
            sensorData.value = {
              timestamp: new Date(),
              temperature: deviceStore.temperature,
              humidity: Math.floor(Math.random() * 30) + 50 
            };
            isModalVisible.value = true;
            console.log('Room clicked, opening modal');
          }

          if (clickedObject === base || clickedObject.parent === lampGroup) {
            deviceStore.toggleLamp();
          }
        }
      });
     
      watch(
        () => props.isDarkTheme,
        (isDark) => {
          applyTheme(isDark);
        },
        { immediate: false }
      );

      watch(
        () => deviceStore.isLampOn,
        (isOn) => {
          if (lampLight) {
            lampLight.visible = isOn;
            baseMaterial.emissive.set(isOn ? 0xffff00 : 0x000000);
          }
        }
      );

      const animate = () => {
        requestAnimationFrame(animate);
        
        if (isMouseDown.value && houseGroup.value) {
          houseGroup.value.rotation.y = mouseX.value * 2;
          houseGroup.value.rotation.x = mouseY.value * 2;
        }

        renderer.render(scene, camera);
      };
      animate();

      return () => {
        window.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      };
    });

    return {
      container,
      isModalVisible,
      sensorData,
    };
  },
});
</script>

<style scoped>
.house-container {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .scene-wrapper {
    height: 66.6vh;
  }
  
  .house-container {
    position: absolute;
    top: -25vh; 
    height: 100vh;
  }
}
</style>