import { Button } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@tanstack/react-store";
import Header from "../components/header";
import { publicOnlyLoader } from "../lib/loaders/auth.loaders";
import { authState } from "../lib/state/auth.state";
import { config } from "../../client.config";

export const Route = createFileRoute("/")({
  component: App,
  loader: publicOnlyLoader,
});

// Custom hook for lazy loading videos
function useLazyVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoadedData = () => {
    setIsLoaded(true);
  };

  return { videoRef, isInView, isLoaded, handleLoadedData };
}

// Video component with lazy loading and poster
function LazyVideo({
  src,
  poster,
  startTime = 0,
  className = "",
}: {
  src: string;
  poster: string;
  startTime?: number;
  className?: string;
}) {
  const { videoRef, isInView, isLoaded, handleLoadedData } = useLazyVideo();
  const cdnSrc = `${config.cdn}/${src}`;
  const cdnPoster = `${config.cdn}/${poster}`;

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={isInView ? cdnSrc : ""}
        poster={cdnPoster}
        autoPlay={isInView}
        muted
        loop
        playsInline
        preload="none"
        onLoadedData={handleLoadedData}
        className={`aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useStore(authState);

  const handleGetStarted = async () => {
    if (isAuthenticated) {
      if (user?.onboarding === "COMPLETE") {
        navigate({ to: "/me" });
      } else {
        navigate({ to: "/chat" });
      }
      return;
    }

    navigate({ to: "/auth/signin" });
  };

  const getButtonText = () => {
    if (!isAuthenticated) {
      return "Get Started";
    }

    if (user?.onboarding === "SIGNUP") {
      return "Continue to Chat";
    } else if (user?.onboarding === "COMPLETE") {
      return "Continue to App";
    } else {
      return "Continue to Chat";
    }
  };

  return (
    <main className="relative isolate h-screen w-full overflow-hidden">
      <Header />

      <svg
        className="absolute inset-x-0 top-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(32rem_32rem_at_center,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84"
            width={200}
            height={200}
            x="50%"
            y={-1}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
          <path
            d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
            strokeWidth={0}
          />
        </svg>
        <rect
          width="100%"
          height="100%"
          strokeWidth={0}
          fill="url(#1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84)"
        />
      </svg>

      <div
        className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
        aria-hidden="true"
      >
        <div
          className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-blue-500 to-lime-400 opacity-40"
          style={{
            clipPath:
              "polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-20 lg:px-8 h-full pb-20">
        <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center h-full">
          <div className="relative w-full max-w-xl lg:shrink-0 xl:max-w-2xl flex flex-col justify-center">
            <h1 className="text-4xl md:text-7xl sm:font-extralight text-zinc-900 text-center lg:text-left">
              <span className="block ">Conversational AI</span>
              <span className="block">
                with actual{" "}
                <span className="bg-gradient-to-r from-blue-600 to-lime-500 bg-clip-text text-transparent ">
                  Taste
                </span>
                .
              </span>
            </h1>

            <div className="mt-10 flex justify-center lg:justify-start">
              <Button
                size="lg"
                color="primary"
                radius="full"
                onPress={handleGetStarted}
                isLoading={isLoading}
              >
                {getButtonText()}
              </Button>
            </div>
          </div>

          <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
            <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80">
              <LazyVideo
                src="demo3.mp4#t=3"
                poster="demo3.webp"
                startTime={3}
              />
            </div>
            <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
              <LazyVideo
                src="demo2.mp4#t=8"
                poster="demo2.webp"
                startTime={8}
              />
              <LazyVideo
                src="demo4.mp4#t=3"
                poster="demo4.webp"
                startTime={3}
              />
            </div>
            <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
              <LazyVideo
                src="demo1.mp4#t=12"
                poster="demo1.webp"
                startTime={12}
              />
              <LazyVideo
                src="demo5.mp4#t=8"
                poster="demo5.webp"
                startTime={8}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
