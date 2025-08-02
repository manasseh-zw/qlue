import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button, Input, Alert } from "@heroui/react";
import { Eye, EyeClosed } from "lucide-react";
import { authState } from "@/lib/state/auth.state";
import { signInWithEmail } from "@/lib/services/auth.service";
import type { User } from "@/lib/types/user";
import type { ApiResponse } from "@/lib/utils/api";
import Logo from "../../components/logo";
import { unauthenticatedOnlyLoader } from "@/lib/loaders/auth.loaders";

export const Route = createFileRoute("/auth/signin")({
  component: SignIn,
  loader: unauthenticatedOnlyLoader,
});

function SignIn() {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    try {
      const data: ApiResponse<User> = await signInWithEmail(
        formData.email,
        formData.password
      );

      if (data.success) {
        authState.setState(() => ({
          user: data.data,
          isAuthenticated: true,
          isLoading: false,
        }));
        router.navigate({ to: "/chat", replace: true });
      } else {
        setErrors(data.errors);
      }
    } catch (error) {
      setErrors(["An unexpected error occurred."]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-content1">
      <div className="flex w-full max-w-xs flex-col gap-4 rounded-large mb-5 px-4 md:px-2">
        <div className="flex flex-col items-center pb-3 gap-3">
          <Logo width={40} height={40} />
          <p className="text-small text-secondary-700">
            Sign in to your account
          </p>
        </div>

        {errors && errors.length > 0 && (
          <Alert
            color="danger"
            description={
              <ul className="list-disc ml-5 mt-1 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            }
            variant="bordered"
          />
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            isRequired
            label="Email"
            type="email"
            variant="flat"
            size="sm"
            classNames={{
              input:
                "focus:outline-none border-transparent focus:border-transparent focus:ring-0",
            }}
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            isDisabled={isLoading}
          />

          <Input
            isRequired
            classNames={{
              input:
                "focus:outline-none border-transparent focus:border-transparent focus:ring-0",
            }}
            endContent={
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                disabled={isLoading}
              >
                {isVisible ? <EyeClosed /> : <Eye />}
              </button>
            }
            label="Password"
            type={isVisible ? "text" : "password"}
            variant="flat"
            size="sm"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            isDisabled={isLoading}
          />

          <Button
            className="w-full"
            color="primary"
            type="submit"
            isDisabled={isLoading}
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-secondary-600">
            Don't have an account?{" "}
            <a href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
