import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Gavel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIAssistant3D = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;

    // Create a gavel shape
    const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 32);
    const headGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.5);
    
    const material = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.9,
      shininess: 100,
    });

    const handle = new THREE.Mesh(handleGeometry, material);
    const head = new THREE.Mesh(headGeometry, material);

    // Position the gavel parts
    handle.position.y = 1;
    head.position.y = 2.1;

    // Create a group for the gavel
    const gavel = new THREE.Group();
    gavel.add(handle);
    gavel.add(head);
    scene.add(gavel);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffd700, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Position camera
    camera.position.z = 5;

    // Animation variables
    let rotationSpeed = 0.01;
    let bounceHeight = 0;
    let bounceDirection = 1;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the gavel
      gavel.rotation.y += rotationSpeed;

      // Bounce animation
      bounceHeight += 0.05 * bounceDirection;
      if (bounceHeight > 0.2) bounceDirection = -1;
      if (bounceHeight < -0.2) bounceDirection = 1;
      
      gavel.position.y = bounceHeight;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      scene.remove(gavel);
      handleGeometry.dispose();
      headGeometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative h-[400px] w-full rounded-lg overflow-hidden bg-judicial-navy/50 backdrop-blur-md border border-judicial-gold/20"
    >
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.5,
            delay: 0.5,
            type: "spring",
            stiffness: 100
          }}
          className="mb-8"
        >
          <Gavel className="h-16 w-16 text-judicial-gold transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Try Our <span className="text-judicial-gold">AI Assistant</span>
        </h2>
        <p className="text-gray-400 mb-6 max-w-md">
          Experience the power of AI in legal research and analysis
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-judicial-gold text-judicial-dark rounded-lg font-semibold hover:bg-judicial-gold/90 transition-colors"
          onClick={() => navigate('/auth')}
        >
          Start Chat
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AIAssistant3D; 