import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { authState } from "@/lib/state/auth.state";
import { protectedLoader } from "@/lib/loaders/auth.loaders";
import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
import { Sparkles, User, Heart, Zap } from "lucide-react";
import Logo from "@/components/logo";

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
  loader: protectedLoader,
});

function RouteComponent() {
  const { user } = useStore(authState);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-content1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo width={48} height={48} />
            <h1 className="text-4xl font-bold text-foreground">
              Welcome to Qlue
            </h1>
          </div>
          <p className="text-xl text-default-600 mb-2">
            Your taste profile is ready, {user.name}!
          </p>
          <Chip 
            color="success" 
            variant="flat" 
            startContent={<Sparkles className="w-4 h-4" />}
          >
            Profile Complete
          </Chip>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Taste Profile Summary */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Your Profile</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="text-sm text-default-600">
                <p><strong>Age:</strong> {user.age || 'Not specified'}</p>
                <p><strong>Interests:</strong> Music, Podcasts, Entertainment</p>
                <p><strong>Style:</strong> Eclectic & Adventurous</p>
              </div>
              <Button 
                color="primary" 
                variant="flat" 
                size="sm"
                className="w-full"
              >
                View Full Profile
              </Button>
            </CardBody>
          </Card>

          {/* Perfect Pitch Mode */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold">Perfect Pitch</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-default-600">
                Experience personalized product recommendations tailored to your unique taste profile.
              </p>
              <Button 
                color="warning" 
                variant="flat"
                className="w-full"
                isDisabled
              >
                Coming Soon
              </Button>
            </CardBody>
          </Card>

          {/* Perfect Date Mode */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-danger" />
                <h3 className="text-lg font-semibold">Perfect Date</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-default-600">
                Connect with an AI companion who truly understands your preferences and personality.
              </p>
              <Button 
                color="danger" 
                variant="flat"
                className="w-full"
                isDisabled
              >
                Coming Soon
              </Button>
            </CardBody>
          </Card>

          {/* Recent Discoveries */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <h3 className="text-lg font-semibold">Recent Discoveries</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Placeholder discovery cards */}
                {[
                  { name: "Indie Folk Artists", type: "Music", confidence: "94%" },
                  { name: "Korean BBQ Spots", type: "Food", confidence: "89%" },
                  { name: "Tech Podcasts", type: "Audio", confidence: "92%" },
                  { name: "Sci-Fi Films", type: "Movies", confidence: "87%" }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg hover:bg-default-50 transition-colors"
                  >
                    <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-default-500">{item.type}</span>
                      <Chip size="sm" variant="flat" color="success">
                        {item.confidence}
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            color="primary" 
            size="lg"
            startContent={<Sparkles className="w-5 h-5" />}
          >
            Explore More Recommendations
          </Button>
          <Button 
            color="default" 
            variant="bordered" 
            size="lg"
          >
            Chat with Qlue AI
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-default-500">
          <p>
            Your taste profile was generated using advanced AI analysis of your preferences and behaviors.
          </p>
          <p className="mt-2">
            Ready to discover what makes you unique? Let's explore together.
          </p>
        </div>
      </div>
    </main>
  );
}
