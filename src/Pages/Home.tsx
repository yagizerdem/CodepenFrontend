import { Outlet, useNavigate } from "react-router";
import { Sidepanel } from "../components/homeRelated/SidePanel";
import { useLocation } from "react-router";
import { useEnsureLoggedIn } from "../hook/ensureLoggedIn";
import { useEnsureProfileFetched } from "../hook/ensureProfileFetched";
import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Button, IconWithBackground } from "../ui";
import {
  FeatherChevronRight,
  FeatherCode,
  FeatherShare2,
  FeatherZap,
} from "@subframe/core";
import { flash } from "../utils/FlashEffect";
import { motion } from "framer-motion";

function HomePage() {
  const { setIsLoading, profile } = useAppContext();
  const location = useLocation();
  const isHome = location.pathname === "/home";

  const { isLoading: loggedInLoader } = useEnsureLoggedIn({
    showErrorMessage: true,
  });
  const { isLoading: profileLoader } = useEnsureProfileFetched({
    showErrorMessage: true,
  });

  useEffect(() => {
    const _isLoading = loggedInLoader || profileLoader;
    setIsLoading(_isLoading);
  }, [loggedInLoader, profileLoader, setIsLoading]);

  return (
    <div className="w-screen h-screen  flex flex-row flex-1 ">
      <Sidepanel />
      <div className="flex-1 overflow-y-scroll">
        {isHome && <HomePageContent />}
        {!isHome && <Outlet />}
      </div>
    </div>
  );
}

function HomePageContent() {
  const navigate = useNavigate();
  return (
    <div className="flex w-full flex-col items-center justify-center gap-24 bg-neutral-900 ">
      <div className="flex min-h-[576px] w-full flex-col items-center justify-center gap-12 overflow-hidden px-4 py-32 relative">
        <div className="flex flex-col items-center justify-center gap-8 z-10">
          <div className="flex items-center gap-1 rounded-md border border-solid border-neutral-100 bg-neutral-100 pl-3 pr-2 py-1">
            <span className="whitespace-nowrap font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font">
              Online Code Editor
            </span>
            <FeatherChevronRight className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-default-font" />
          </div>
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            <span className="w-full font-['Inter'] text-[48px] font-[700] leading-[48px] text-white text-center -tracking-[0.035em]">
              Build. Code. Share.
            </span>
            <span className="w-full whitespace-pre-wrap font-['Inter'] text-[24px] font-[500] leading-[32px] text-white text-center -tracking-[0.025em]">
              {
                "The best online code editor for developers to build and share amazing web creations"
              }
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="large"
              icon={<FeatherCode />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                flash();
                navigate("/home/create-pen");
              }}
            >
              Start Coding
            </Button>
            <Button
              variant="neutral-secondary"
              size="large"
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                flash();
                navigate("/home/search-pen");
              }}
            >
              Explore
            </Button>
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start bg-[#000000cc] absolute inset-0" />
        <img
          className="w-full grow shrink-0 basis-0 object-cover absolute inset-0"
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-24 px-4 py-24">
        <div className="flex w-full max-w-[1280px] flex-wrap items-start justify-center gap-8">
          <div className="flex min-w-[320px] max-w-[384px] grow shrink-0 basis-0 flex-col items-start gap-6 rounded-[32px] bg-neutral-800 px-8 py-8">
            <IconWithBackground size="large" icon={<FeatherCode />} />
            <div className="flex w-full flex-col items-start gap-4">
              <span className="w-full font-['Inter'] text-[28px] font-[700] leading-[28px] text-white -tracking-[0.035em]">
                Write Code
              </span>
              <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[24px] text-white -tracking-[0.01em]">
                {"HTML, CSS, and JavaScript with instant preview"}
              </span>
            </div>
          </div>
          <div className="flex min-w-[320px] max-w-[384px] grow shrink-0 basis-0 flex-col items-start gap-6 rounded-[32px] bg-neutral-800 px-8 py-8">
            <IconWithBackground
              variant="success"
              size="large"
              icon={<FeatherShare2 />}
            />
            <div className="flex w-full flex-col items-start gap-4">
              <span className="w-full font-['Inter'] text-[28px] font-[700] leading-[28px] text-white -tracking-[0.035em]">
                Share Instantly
              </span>
              <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[24px] text-white -tracking-[0.01em]">
                {"Share your creations with developers worldwide"}
              </span>
            </div>
          </div>
          <div className="flex min-w-[320px] max-w-[384px] grow shrink-0 basis-0 flex-col items-start gap-6 rounded-[32px] bg-neutral-800 px-8 py-8">
            <IconWithBackground
              variant="warning"
              size="large"
              icon={<FeatherZap />}
            />
            <div className="flex w-full flex-col items-start gap-4">
              <span className="w-full font-['Inter'] text-[28px] font-[700] leading-[28px] text-white -tracking-[0.035em]">
                Real-time
              </span>
              <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[24px] text-white -tracking-[0.01em]">
                {"See your changes instantly as you code"}
              </span>
            </div>
          </div>
        </div>
      </div>
<<<<<<< HEAD
      <ImageGallery />
=======
>>>>>>> origin/main
    </div>
  );
}

export { HomePage };

function FadeInImage({ src }: { src: string }) {
  return (
    <motion.img
      src={src}
      alt="Demo"
      className="rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
    />
  );
}

export default function ImageGallery() {
  const images = Array.from({ length: 6 }).map(
    (_, i) => `https://picsum.photos/600/40${i}`
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((src, i) => (
        <FadeInImage key={i} src={src} />
      ))}
    </div>
  );
}
