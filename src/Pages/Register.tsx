// "use client"  // Next.js kullanıyorsan aç
import { useEffect, useRef, useState } from "react";

function RegisterPage() {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    // Function to load scripts from CDN
    const loadScript = (src, onLoad) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = onLoad;
      document.head.appendChild(script);
      return script;
    };

    // Check if scripts are already loaded
    if (window.THREE && window.VANTA) {
      initVanta();
      return;
    }

    // Load Three.js first, then Vanta
    if (!window.THREE) {
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js",
        () => {
          if (!window.VANTA) {
            loadScript(
              "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js",
              initVanta
            );
          } else {
            initVanta();
          }
        }
      );
    } else if (!window.VANTA) {
      loadScript(
        "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js",
        initVanta
      );
    }

    function initVanta() {
      if (vantaRef.current && window.VANTA) {
        const effect = window.VANTA.WAVES({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x29292f,
          shininess: 50.0,
          waveHeight: 20.0,
          waveSpeed: 1.15,
          zoom: 0.65,
        });
        setVantaEffect(effect);
      }
    }

    // Cleanup function
    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    ></div>
  );
}

export { RegisterPage };
