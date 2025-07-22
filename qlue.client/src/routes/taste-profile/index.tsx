import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useAuth } from "../../lib/providers/auth.provider";

interface UserInterests {
  name: string;
  age: number;
  gender: string;
  music: string[];
  podcasts: string[];
  booksShowsMovies: string[];
  hobbiesOther: string[];
}

export const Route = createFileRoute("/taste-profile/")({
  component: TasteProfileComponent,
});

function TasteProfileComponent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your taste profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.navigate({ to: "/" });
    return null;
  }

  if (!user.interests || user.onboarding !== "COMPLETE") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">
            We couldn't load your taste profile. This might be because you
            haven't completed the onboarding yet.
          </p>
          <button
            onClick={() => router.navigate({ to: "/chat" })}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Complete Your Profile
          </button>
        </div>
      </div>
    );
  }

  const interests = user.interests as UserInterests;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Your Unique Taste Profile
          </h1>
          <p className="text-xl text-gray-600">
            Here's what makes {interests.name} uniquely awesome! 🎉
          </p>
        </div>

        {/* Profile Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* User Info Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
            <div className="flex items-center space-x-6">
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-20 h-20 rounded-full border-4 border-white/30"
                />
              )}
              <div>
                <h2 className="text-3xl font-bold">{interests.name}</h2>
                <p className="text-purple-100 text-lg">
                  {interests.age} years old • {interests.gender}
                </p>
              </div>
            </div>
          </div>

          {/* Interests Grid */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Music */}
              <div className="bg-gradient-to-br from-pink-50 to-red-50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  🎵 Music Vibes
                </h3>
                <div className="space-y-2">
                  {interests.music.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/80 px-4 py-2 rounded-lg text-gray-700 font-medium"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Podcasts */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  🎙️ Podcast Obsessions
                </h3>
                <div className="space-y-2">
                  {interests.podcasts.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/80 px-4 py-2 rounded-lg text-gray-700 font-medium"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Books/Shows/Movies */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  📚 Entertainment Picks
                </h3>
                <div className="space-y-2">
                  {interests.booksShowsMovies.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/80 px-4 py-2 rounded-lg text-gray-700 font-medium"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hobbies & Other */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  ⭐ Other Passions
                </h3>
                <div className="space-y-2">
                  {interests.hobbiesOther.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/80 px-4 py-2 rounded-lg text-gray-700 font-medium"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-12 text-center space-y-4">
              <p className="text-gray-600 text-lg">
                Your taste profile is ready! 🎉
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.navigate({ to: "/chat" })}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Continue Chatting
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Refresh Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
