"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { Button } from "@/components/ui/button"

type ModelType = "male" | "female"

export default function MannequinViewer() {
  const maleContainerRef = useRef<HTMLDivElement>(null)
  const femaleContainerRef = useRef<HTMLDivElement>(null)

  const maleSceneRef = useRef<THREE.Scene | null>(null)
  const maleCameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const maleRendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const malePlatformRef = useRef<THREE.Group | null>(null)
  const maleAnimationFrameRef = useRef<number | null>(null)

  const femaleSceneRef = useRef<THREE.Scene | null>(null)
  const femaleCameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const femaleRendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const femalePlatformRef = useRef<THREE.Group | null>(null)
  const femaleAnimationFrameRef = useRef<number | null>(null)

  const [activeModel, setActiveModel] = useState<ModelType>("male")
  const [isLoading, setIsLoading] = useState(true)

  const loadGLBModel = async (): Promise<THREE.Group | null> => {
    return new Promise((resolve) => {
      const loader = new GLTFLoader()
      loader.load(
        "/images/uploads-files-4928388-radyplayer-2bme-2bcasual-2bman.glb",
        (gltf) => {
          const model = gltf.scene

          model.traverse((child) => {
            if (child.name === "Wolf3D_Glasses") {
              child.visible = false
            }

            if (child instanceof THREE.Mesh) {
              if (child.material) {
                const material = child.material as THREE.MeshStandardMaterial
                material.color.setHex(0xffffff)
                material.needsUpdate = true
              }
            }
          })

          const box = new THREE.Box3().setFromObject(model)
          const size = new THREE.Vector3()
          box.getSize(size)

          const desiredHeight = 1.8
          const currentHeight = size.y
          const scale = desiredHeight / currentHeight
          model.scale.set(scale, scale, scale)

          const newBox = new THREE.Box3().setFromObject(model)
          const newBottomY = newBox.min.y
          model.position.y = -0.475 - newBottomY



          resolve(model)
        },
        undefined,
        (error) => {
          console.error("Error loading GLB model:", error)
          resolve(null)
        },
      )
    })
  }

  const createRealisticHumanoid = (type: ModelType): THREE.Group => {
    const group = new THREE.Group()

    const isMale = type === "male"
    const skinColor = 0xffffff
    const clothingColor = isMale ? 0x2c5f8d : 0x8d2c5f

    const headGeometry = new THREE.SphereGeometry(0.13, 32, 32)
    headGeometry.scale(1, 1.15, 1)
    const head = new THREE.Mesh(
      headGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    head.position.y = 1.68
    group.add(head)

    const neckGeometry = new THREE.CylinderGeometry(0.055, 0.065, 0.12, 16)
    const neck = new THREE.Mesh(
      neckGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    neck.position.y = 1.56
    group.add(neck)

    const chestWidth = isMale ? 0.22 : 0.19
    const chestDepth = isMale ? 0.15 : 0.14
    const chestGeometry = new THREE.BoxGeometry(chestWidth, 0.35, chestDepth, 8, 8, 8)
    const chest = new THREE.Mesh(
      chestGeometry,
      new THREE.MeshStandardMaterial({
        color: clothingColor,
        roughness: 0.8,
        metalness: 0.0,
      }),
    )
    chest.position.y = 1.3
    group.add(chest)

    const shoulderGeometry = new THREE.SphereGeometry(0.08, 16, 16)
    const leftShoulder = new THREE.Mesh(
      shoulderGeometry,
      new THREE.MeshStandardMaterial({
        color: clothingColor,
        roughness: 0.8,
        metalness: 0.0,
      }),
    )
    leftShoulder.position.set(-0.18, 1.42, 0)
    group.add(leftShoulder)



    const rightShoulder = new THREE.Mesh(
      shoulderGeometry,
      new THREE.MeshStandardMaterial({
        color: clothingColor,
        roughness: 0.8,
        metalness: 0.0,
      }),
    )
    rightShoulder.position.set(0.18, 1.42, 0)
    group.add(rightShoulder)

    const abdomenWidth = isMale ? 0.2 : 0.17
    const abdomenGeometry = new THREE.BoxGeometry(abdomenWidth, 0.25, 0.13, 8, 8, 8)
    const abdomen = new THREE.Mesh(
      abdomenGeometry,
      new THREE.MeshStandardMaterial({
        color: clothingColor,
        roughness: 0.8,
        metalness: 0.0,
      }),
    )
    abdomen.position.y = 1.0
    group.add(abdomen)

    const hipsWidth = isMale ? 0.2 : 0.22
    const hipsGeometry = new THREE.BoxGeometry(hipsWidth, 0.18, 0.14, 8, 8, 8)
    const hips = new THREE.Mesh(
      hipsGeometry,
      new THREE.MeshStandardMaterial({
        color: clothingColor,
        roughness: 0.8,
        metalness: 0.0,
      }),
    )
    hips.position.y = 0.78
    group.add(hips)

    const armLength = 0.28
    const upperArmGeometry = new THREE.CylinderGeometry(0.045, 0.04, armLength, 16)

    const leftUpperArm = new THREE.Mesh(
      upperArmGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    leftUpperArm.position.set(-0.24, 1.28, 0)
    group.add(leftUpperArm)

    const rightUpperArm = new THREE.Mesh(
      upperArmGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    rightUpperArm.position.set(0.24, 1.28, 0)
    group.add(rightUpperArm)

    const elbowGeometry = new THREE.SphereGeometry(0.042, 12, 12)
    const leftElbow = new THREE.Mesh(
      elbowGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    leftElbow.position.set(-0.24, 1.14, 0)
    group.add(leftElbow)

    const rightElbow = new THREE.Mesh(
      elbowGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    rightElbow.position.set(0.24, 1.14, 0)
    group.add(rightElbow)

    const forearmGeometry = new THREE.CylinderGeometry(0.038, 0.035, 0.26, 16)

    const leftForearm = new THREE.Mesh(
      forearmGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    leftForearm.position.set(-0.24, 0.88, 0)
    group.add(leftForearm)

    const rightForearm = new THREE.Mesh(
      forearmGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    rightForearm.position.set(0.24, 0.88, 0)
    group.add(rightForearm)

    const handGeometry = new THREE.BoxGeometry(0.06, 0.1, 0.04, 4, 4, 4)

    const leftHand = new THREE.Mesh(
      handGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    leftHand.position.set(-0.24, 0.7, 0)
    group.add(leftHand)

    const rightHand = new THREE.Mesh(
      handGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    rightHand.position.set(0.24, 0.7, 0)
    group.add(rightHand)

    const thighGeometry = new THREE.CylinderGeometry(0.075, 0.065, 0.42, 16)

    const leftThigh = new THREE.Mesh(
      thighGeometry,
      new THREE.MeshStandardMaterial({
        color: clothingColor,
        roughness: 0.8,
        metalness: 0.0,
      }),
    )
    leftThigh.position.set(-0.09, 0.48, 0)
    group.add(leftThigh)

    const rightThigh = new THREE.Mesh(
      thighGeometry,
      new THREE.MeshStandardMaterial({
        color: clothingColor,
        roughness: 0.8,
        metalness: 0.0,
      }),
    )
    rightThigh.position.set(0.09, 0.48, 0)
    group.add(rightThigh)

    const kneeGeometry = new THREE.SphereGeometry(0.055, 12, 12)
    const leftKnee = new THREE.Mesh(
      kneeGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    leftKnee.position.set(-0.09, 0.27, 0)
    group.add(leftKnee)

    const rightKnee = new THREE.Mesh(
      kneeGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    rightKnee.position.set(0.09, 0.27, 0)
    group.add(rightKnee)

    const shinGeometry = new THREE.CylinderGeometry(0.055, 0.048, 0.4, 16)

    const leftShin = new THREE.Mesh(
      shinGeometry,
      new THREE.MeshStandardMaterial({
        color: clothingColor,
        roughness: 0.8,
        metalness: 0.0,
      }),
    )
    leftShin.position.set(-0.09, 0.07, 0)
    group.add(leftShin)

    const rightShin = new THREE.Mesh(
      shinGeometry,
      new THREE.MeshStandardMaterial({
        color: clothingColor,
        roughness: 0.8,
        metalness: 0.0,
      }),
    )
    rightShin.position.set(0.09, 0.07, 0)
    group.add(rightShin)

    const footGeometry = new THREE.BoxGeometry(0.08, 0.06, 0.18, 4, 4, 4)

    const leftFoot = new THREE.Mesh(
      footGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    leftFoot.position.set(-0.09, -0.14, 0.04)
    group.add(leftFoot)

    const rightFoot = new THREE.Mesh(
      footGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
        metalness: 0.1,
      }),
    )
    rightFoot.position.set(0.09, -0.14, 0.04)
    group.add(rightFoot)

    return group
  }

  const createPlatform = (): THREE.Group => {
    const group = new THREE.Group()

    const diskGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32)
    const diskMaterial = new THREE.MeshPhongMaterial({
      color: 0xe0e0e0,
      flatShading: false,
    })
    const disk = new THREE.Mesh(diskGeometry, diskMaterial)
    disk.position.y = -0.5
    group.add(disk)

    const lineCount = 32
    const radius = 0.5
    const lineHeight = 0.05

    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      const lineGeometry = new THREE.BoxGeometry(0.001, lineHeight, 0.001)
      const lineMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
      const line = new THREE.Mesh(lineGeometry, lineMaterial)
      line.position.set(x, -0.5, z)
      group.add(line)
    }

    return group
  }

  const createRotationHandlers = (platformRef: React.MutableRefObject<THREE.Group | null>) => {
    const isDraggingRef = { current: false }
    const previousMousePositionRef = { current: { x: 0, y: 0 } }

    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true
      previousMousePositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !platformRef.current) return

      const deltaX = e.clientX - previousMousePositionRef.current.x
      const rotationSpeed = 0.01
      const rotationDelta = deltaX * rotationSpeed

      platformRef.current.rotation.y += rotationDelta

      previousMousePositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }

    const handlePointerUp = () => {
      isDraggingRef.current = false
    }

    return { handlePointerDown, handlePointerMove, handlePointerUp }
  }

  useEffect(() => {
    if (!maleContainerRef.current) return

    const initMaleScene = async () => {
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xffffff)
      maleSceneRef.current = scene

      const camera = new THREE.PerspectiveCamera(
        50,
        maleContainerRef.current!.clientWidth / maleContainerRef.current!.clientHeight,
        0.1,
        1000,
      )
      camera.position.set(0, 1.3, 3.5)
      camera.lookAt(0, 0.3, 0)
      maleCameraRef.current = camera

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(maleContainerRef.current!.clientWidth, maleContainerRef.current!.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      maleContainerRef.current!.appendChild(renderer.domElement)
      maleRendererRef.current = renderer

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
      directionalLight.position.set(5, 10, 5)
      scene.add(directionalLight)

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
      fillLight.position.set(-5, 5, -5)
      scene.add(fillLight)

      const backLight = new THREE.DirectionalLight(0xffffff, 0.3)
      backLight.position.set(0, 5, -5)
      scene.add(backLight)

      const platform = createPlatform()
      scene.add(platform)
      malePlatformRef.current = platform

      const loadedModel = await loadGLBModel()
      if (loadedModel) {
        platform.add(loadedModel)
      }

      const animate = () => {
        maleAnimationFrameRef.current = requestAnimationFrame(animate)
        maleRendererRef.current?.render(scene, camera)
      }
      animate()

      const { handlePointerDown, handlePointerMove, handlePointerUp } = createRotationHandlers(malePlatformRef)

      const canvas = maleRendererRef.current?.domElement
      canvas?.addEventListener("pointerdown", handlePointerDown)
      canvas?.addEventListener("pointermove", handlePointerMove)
      canvas?.addEventListener("pointerup", handlePointerUp)
      canvas?.addEventListener("pointerleave", handlePointerUp)

      const handleResize = () => {
        if (!maleContainerRef.current || !maleCameraRef.current || !maleRendererRef.current) return
        maleCameraRef.current.aspect = maleContainerRef.current.clientWidth / maleContainerRef.current.clientHeight
        maleCameraRef.current.updateProjectionMatrix()
        maleRendererRef.current.setSize(maleContainerRef.current.clientWidth, maleContainerRef.current.clientHeight)
      }
      window.addEventListener("resize", handleResize)

      setIsLoading(false)

      return () => {
        window.removeEventListener("resize", handleResize)
        canvas?.removeEventListener("pointerdown", handlePointerDown)
        canvas?.removeEventListener("pointermove", handlePointerMove)
        canvas?.removeEventListener("pointerup", handlePointerUp)
        canvas?.removeEventListener("pointerleave", handlePointerUp)

        if (maleAnimationFrameRef.current) {
          cancelAnimationFrame(maleAnimationFrameRef.current)
        }
        if (
          maleContainerRef.current &&
          maleRendererRef.current?.domElement &&
          maleContainerRef.current.contains(maleRendererRef.current.domElement)
        ) {
          maleContainerRef.current.removeChild(maleRendererRef.current.domElement)
        }
        maleRendererRef.current?.dispose()
      }
    }

    const cleanup = initMaleScene()
    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.())
    }
  }, [])

  useEffect(() => {
    if (!femaleContainerRef.current) return

    const initFemaleScene = async () => {
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xffffff)
      femaleSceneRef.current = scene

      const camera = new THREE.PerspectiveCamera(
        50,
        femaleContainerRef.current!.clientWidth / femaleContainerRef.current!.clientHeight,
        0.1,
        1000,
      )
      camera.position.set(0, 1.3, 3.5)
      camera.lookAt(0, 0.3, 0)
      femaleCameraRef.current = camera

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(femaleContainerRef.current!.clientWidth, femaleContainerRef.current!.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      femaleContainerRef.current!.appendChild(renderer.domElement)
      femaleRendererRef.current = renderer

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
      directionalLight.position.set(5, 10, 5)
      scene.add(directionalLight)

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
      fillLight.position.set(-5, 5, -5)
      scene.add(fillLight)

      const backLight = new THREE.DirectionalLight(0xffffff, 0.3)
      backLight.position.set(0, 5, -5)
      scene.add(backLight)

      const platform = createPlatform()
      scene.add(platform)
      femalePlatformRef.current = platform

      const femaleModel = createRealisticHumanoid("female")

      const box = new THREE.Box3().setFromObject(femaleModel)
      const bottomY = box.min.y
      femaleModel.position.y = -0.475 - bottomY

      platform.add(femaleModel)

      const animate = () => {
        femaleAnimationFrameRef.current = requestAnimationFrame(animate)
        femaleRendererRef.current?.render(scene, camera)
      }
      animate()

      const { handlePointerDown, handlePointerMove, handlePointerUp } = createRotationHandlers(femalePlatformRef)

      const canvas = femaleRendererRef.current?.domElement
      canvas?.addEventListener("pointerdown", handlePointerDown)
      canvas?.addEventListener("pointermove", handlePointerMove)
      canvas?.addEventListener("pointerup", handlePointerUp)
      canvas?.addEventListener("pointerleave", handlePointerUp)

      const handleResize = () => {
        if (!femaleContainerRef.current || !femaleCameraRef.current || !femaleRendererRef.current) return
        femaleCameraRef.current.aspect =
          femaleContainerRef.current.clientWidth / femaleContainerRef.current.clientHeight
        femaleCameraRef.current.updateProjectionMatrix()
        femaleRendererRef.current.setSize(
          femaleContainerRef.current.clientWidth,
          femaleContainerRef.current.clientHeight,
        )
      }
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        canvas?.removeEventListener("pointerdown", handlePointerDown)
        canvas?.removeEventListener("pointermove", handlePointerMove)
        canvas?.removeEventListener("pointerup", handlePointerUp)
        canvas?.removeEventListener("pointerleave", handlePointerUp)

        if (femaleAnimationFrameRef.current) {
          cancelAnimationFrame(femaleAnimationFrameRef.current)
        }
        if (
          femaleContainerRef.current &&
          femaleRendererRef.current?.domElement &&
          femaleContainerRef.current.contains(femaleRendererRef.current.domElement)
        ) {
          femaleContainerRef.current.removeChild(femaleRendererRef.current.domElement)
        }
        femaleRendererRef.current?.dispose()
      }
    }

    const cleanup = initFemaleScene()
    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.())
    }
  }, [])

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <div
        ref={maleContainerRef}
        className="absolute inset-0 touch-none"
        style={{
          cursor: "grab",
          visibility: activeModel === "male" ? "visible" : "hidden",
          pointerEvents: activeModel === "male" ? "auto" : "none",
        }}
      />

      <div
        ref={femaleContainerRef}
        className="absolute inset-0 touch-none"
        style={{
          cursor: "grab",
          visibility: activeModel === "female" ? "visible" : "hidden",
          pointerEvents: activeModel === "female" ? "auto" : "none",
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-[2px] transition-all duration-500">
          <div className="flex flex-col items-center gap-5 p-8 rounded-3xl bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60">
            {/* Advanced Double Spinner */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-[3px] border-gray-200/50"></div>
              <div className="absolute inset-0 rounded-full border-[3px] border-gray-900 border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-[3px] border-gray-400/30 border-b-transparent animate-spin-slow reverse"></div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-gray-800 tracking-wider uppercase animate-pulse">
                Loading Experience
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                Preparing 3D Assets...
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-16 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2 sm:gap-4 bg-background/70 backdrop-blur-sm p-2 sm:p-3 rounded-lg shadow-lg">
        <Button
          variant={activeModel === "male" ? "default" : "outline"}
          onClick={() => setActiveModel("male")}
          className="min-w-24 sm:min-w-32 text-sm sm:text-base rounded-none"
          disabled={isLoading}
        >
          Sai Sarthak
        </Button>
        <Button
          variant={activeModel === "female" ? "default" : "outline"}
          onClick={() => setActiveModel("female")}
          className="min-w-24 sm:min-w-32 text-sm sm:text-base rounded-none"
          disabled={isLoading}
        >
          Xsai
        </Button>
      </div>

    </div>
  )
}
