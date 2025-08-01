import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Avatar,
  Chip,
} from "@heroui/react";
import { User, Edit3, Heart, Music, Film, BookOpen } from "lucide-react";

interface UserProfileCardProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  stats: {
    primaryInterests: number;
    domainsExplored: number;
    crossDomainInsights: number;
  };
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  stats,
}) => {
  return (
    <Card className="w-[400px] border border-gray-100">
      <CardHeader className="relative flex h-[100px] flex-col justify-end overflow-visible bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
        <Avatar
          className="h-20 w-20 translate-y-12 border-4 border-white"
          src={
            user.image ||
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
          }
        />
        <Button
          className="absolute right-3 top-3 bg-white/20 text-white backdrop-blur-sm"
          radius="full"
          size="sm"
          variant="light"
          startContent={<Edit3 className="w-4 h-4" />}
        >
          Edit Profile
        </Button>
      </CardHeader>
      <CardBody>
        <div className="pb-4 pt-6">
          <p className="text-large font-medium">{user.name}</p>
          <p className="max-w-[90%] text-small text-gray-500">{user.email}</p>
          <div className="flex gap-2 pb-1 pt-2">
            <Chip variant="flat" startContent={<Heart className="w-3 h-3" />}>
              Taste Profile
            </Chip>
            <Chip variant="flat" startContent={<Music className="w-3 h-3" />}>
              Music
            </Chip>
            <Chip variant="flat" startContent={<Film className="w-3 h-3" />}>
              Movies
            </Chip>
          </div>
          <p className="py-2 text-small text-gray-600">
            Discover your unique taste preferences and get personalized
            recommendations.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="text-center">
              <p className="text-small font-medium text-gray-700">
                {stats.primaryInterests}
              </p>
              <p className="text-small text-gray-500">Interests</p>
            </div>
            <div className="text-center">
              <p className="text-small font-medium text-gray-700">
                {stats.domainsExplored}
              </p>
              <p className="text-small text-gray-500">Domains</p>
            </div>
            <div className="text-center">
              <p className="text-small font-medium text-gray-700">
                {stats.crossDomainInsights}
              </p>
              <p className="text-small text-gray-500">Insights</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
