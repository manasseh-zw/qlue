import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { ArrowLeft, PhoneOff } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Conversation } from "../../../components/cvi/components/conversation";

export const Route = createFileRoute("/__app/meet/")({
  component: MeetComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    url: search.url as string,
  }),
});

function MeetComponent() {
  const search = useSearch({ from: "/__app/meet/" });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const conversationUrl = search.url;

  useEffect(() => {
    if (!conversationUrl) {
      setError("No conversation URL provided");
      setIsLoading(false);
      return;
    }

    // Simulate loading time for CVI component
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [conversationUrl]);

  const handleEndCall = () => {
    // Navigate back to personas page
    navigate({ to: "/personas" });
  };

  const handleGoBack = () => {
    navigate({ to: "/personas" });
  };

  if (!conversationUrl) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <PhoneOff className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Conversation URL</h2>
            <p className="text-gray-600 mb-4">
              Please start a conversation from the personas page.
            </p>
          </div>
          <Button
            color="primary"
            onPress={handleGoBack}
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back to Personas
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <PhoneOff className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
          <Button
            color="primary"
            onPress={handleGoBack}
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back to Personas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-black">
      {/* Header with controls */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-white hover:bg-white/20"
              onPress={handleGoBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-white">
              <h1 className="text-lg font-semibold">Live Conversation</h1>
              <p className="text-sm text-white/70">Powered by Tavus</p>
            </div>
          </div>

          <Button
            color="danger"
            variant="flat"
            size="sm"
            startContent={<PhoneOff className="w-4 h-4" />}
            onPress={handleEndCall}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            End Call
          </Button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg font-semibold">
              Connecting to conversation...
            </p>
            <p className="text-sm text-white/70 mt-2">
              Please wait while we establish your video call
            </p>
          </div>
        </div>
      )}

      {/* CVI Conversation component */}
      <div className="h-full w-full pt-16">
        <div
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <Conversation
            conversationUrl={conversationUrl}
            onLeave={handleEndCall}
          />
        </div>
      </div>
    </div>
  );
}
