'use client'

import { useEffect, useRef } from 'react'

export function DentalOrbitScene() {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || typeof window === 'undefined') return

    let cancelled = false
    let cleanup: (() => void) | undefined

    void (async () => {
      let THREE: typeof import('three')
      try {
        THREE = await import('three')
      } catch (err) {
        console.warn('DentalOrbitScene: failed to load three.js', err)
        return
      }
      if (cancelled) return

      // Quick WebGL feature check — some browsers/devices (privacy mode,
      // hardware accel off, old mobiles) don't support it. Fail silently
      // rather than crashing the page.
      const probe = document.createElement('canvas')
      const probeCtx =
        probe.getContext('webgl2') ||
        probe.getContext('webgl') ||
        probe.getContext('experimental-webgl')
      if (!probeCtx) {
        return
      }

      let renderer: import('three').WebGLRenderer
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        })
      } catch (err) {
        console.warn('DentalOrbitScene: WebGLRenderer init failed', err)
        return
      }

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
      camera.position.set(0, 3.2, 9.5)

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.domElement.setAttribute('aria-hidden', 'true')
      renderer.domElement.dataset.scene = 'dental-orbit'
      renderer.domElement.style.display = 'block'
      host.appendChild(renderer.domElement)

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
      keyLight.position.set(1.5, 6, 4)
      keyLight.castShadow = true
      scene.add(keyLight)
      scene.add(new THREE.HemisphereLight(0xdffdf5, 0x1c2e2a, 1.7))

      const toothMaterial = new THREE.MeshPhysicalMaterial({
        color: '#f8fffb',
        roughness: 0.34,
        metalness: 0,
        clearcoat: 0.28,
        clearcoatRoughness: 0.22,
        transmission: 0.06,
      })
      const gumMaterial = new THREE.MeshStandardMaterial({
        color: '#ff6b79',
        roughness: 0.52,
        metalness: 0,
      })
      const scanMaterial = new THREE.MeshBasicMaterial({
        color: '#08b6a8',
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      const lineMaterial = new THREE.LineBasicMaterial({
        color: '#08b6a8',
        transparent: true,
        opacity: 0.58,
      })

      const stage = new THREE.Group()
      stage.position.set(0.3, 0.95, 0)
      scene.add(stage)

      const gum = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.16, 20, 96, Math.PI), gumMaterial)
      gum.rotation.set(Math.PI / 2, 0, 0)
      gum.position.y = -0.56
      gum.castShadow = true
      gum.receiveShadow = true
      stage.add(gum)

      const toothProfile = [
        new THREE.Vector2(0.08, -0.82),
        new THREE.Vector2(0.26, -0.7),
        new THREE.Vector2(0.36, -0.36),
        new THREE.Vector2(0.32, 0.2),
        new THREE.Vector2(0.23, 0.52),
        new THREE.Vector2(0.1, 0.68),
        new THREE.Vector2(0, 0.72),
      ]
      const toothGeometry = new THREE.LatheGeometry(toothProfile, 28)

      for (let i = 0; i < 13; i += 1) {
        const t = i / 12
        const angle = Math.PI * (0.12 + 0.76 * t)
        const radius = 2.75
        const tooth = new THREE.Mesh(toothGeometry, toothMaterial)
        tooth.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 1.8)
        tooth.rotation.y = Math.PI / 2 - angle
        const scale = 0.72 + Math.sin(t * Math.PI) * 0.22
        tooth.scale.setScalar(scale)
        tooth.castShadow = true
        tooth.receiveShadow = true
        stage.add(tooth)
      }

      const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 2.25, 1, 1), scanMaterial)
      scanPlane.position.set(0, 0.45, 0.65)
      scanPlane.rotation.x = -0.36
      stage.add(scanPlane)

      const linePoints: import('three').Vector3[] = []
      for (let i = 0; i <= 80; i += 1) {
        const t = i / 80
        const angle = Math.PI * (0.13 + 0.74 * t)
        linePoints.push(
          new THREE.Vector3(Math.cos(angle) * 3.06, 1.05, Math.sin(angle) * 3.06 - 1.8),
        )
      }
      const scanLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(linePoints),
        lineMaterial,
      )
      stage.add(scanLine)

      const cursor = { x: 0, y: 0 }
      const onPointerMove = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect()
        cursor.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
        cursor.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
      }

      const resize = () => {
        const { width, height } = host.getBoundingClientRect()
        if (!width || !height) return
        renderer.setSize(width, height, false)
        camera.aspect = width / Math.max(height, 1)
        camera.updateProjectionMatrix()
      }

      let frame = 0
      let lost = false
      const onContextLost = (event: Event) => {
        event.preventDefault()
        lost = true
        window.cancelAnimationFrame(frame)
      }
      renderer.domElement.addEventListener('webglcontextlost', onContextLost)

      const clock = new THREE.Clock()
      const animate = () => {
        if (lost) return
        try {
          const elapsed = clock.getElapsedTime()
          stage.rotation.y = Math.sin(elapsed * 0.34) * 0.12 + cursor.x * 0.08
          stage.rotation.x = -0.12 + cursor.y * 0.04
          scanPlane.position.y = 0.36 + Math.sin(elapsed * 1.2) * 0.22
          scanLine.position.y = Math.sin(elapsed * 1.2) * 0.26
          renderer.render(scene, camera)
          frame = window.requestAnimationFrame(animate)
        } catch (err) {
          console.warn('DentalOrbitScene: render loop aborted', err)
        }
      }

      resize()
      animate()
      window.addEventListener('resize', resize)
      host.addEventListener('pointermove', onPointerMove)

      cleanup = () => {
        window.cancelAnimationFrame(frame)
        window.removeEventListener('resize', resize)
        host.removeEventListener('pointermove', onPointerMove)
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
        if (renderer.domElement.parentNode === host) {
          host.removeChild(renderer.domElement)
        }
        toothGeometry.dispose()
        gum.geometry.dispose()
        scanPlane.geometry.dispose()
        scanLine.geometry.dispose()
        toothMaterial.dispose()
        gumMaterial.dispose()
        scanMaterial.dispose()
        lineMaterial.dispose()
        renderer.dispose()
      }

      if (cancelled) cleanup()
    })()

    return () => {
      cancelled = true
      if (cleanup) {
        try {
          cleanup()
        } catch (err) {
          console.warn('DentalOrbitScene: cleanup error', err)
        }
      }
    }
  }, [])

  return <div ref={hostRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} />
}
