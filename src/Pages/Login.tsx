import { useNavigate, useNavigation } from "react-router";
import type { LoginDTO } from "../models/dto/LogInDTO";
import type { RegisterDTO } from "../models/dto/RegisterDTO";
import { Button } from "../ui/components/Button";
import { TextField } from "../ui/components/TextField";
import { useEffect, useRef, useState } from "react";

function LoginPage() {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);
  const [formData, setFormData] = useState<LoginDTO>({
    Email: "",
    Password: "",
  });
  const navigate = useNavigate();

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

  async function hanldeLogin() {
    try {
      console.log(formData);
    } catch (error) {
      console.log(error);
    }
  }

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
    >
      <div
        className="flex w-full max-w-md mx-auto relative flex-col items-center gap-8 
                p-6 md:p-8 rounded-xl 
                max-h-screen overflow-y-auto"
      >
        <div className="absolute inset-0 bg-white opacity-40 rounded-xl z-0"></div>

        <div className="flex w-full flex-col items-center gap-2 relative z-10">
          <span className="text-xl md:text-2xl font-bold text-gray-800 text-center">
            Login your account
          </span>
          <span className="text-sm md:text-base text-gray-600 text-center">
            Fill in your details to get started
          </span>
        </div>
        <div className="flex w-full flex-col items-start gap-6 relative z-10">
          <TextField
            className="h-auto w-full flex-none"
            label="Email"
            helpText=""
          >
            <TextField.Input
              placeholder="Enter your email address"
              value={formData.Email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, Email: event.target.value });
              }}
            />
          </TextField>
          <TextField
            className="h-auto w-full flex-none"
            label="Password"
            helpText=""
          >
            <TextField.Input
              type="password"
              placeholder="Create a password"
              value={formData.Password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, Password: event.target.value });
              }}
            />
          </TextField>
          <Button
            className="h-10 w-full flex-none"
            size="large"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              hanldeLogin();
            }}
          >
            Login to account
          </Button>
          <a
            className="text-blue-700 cursor-pointer"
            onMouseUp={() => {
              navigate("/register");
            }}
          >
            clikc here if dont have account
          </a>
        </div>
      </div>
    </div>
  );
}
export { LoginPage };
