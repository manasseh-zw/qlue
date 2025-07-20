import { Button } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="App">
      <main className="text-3xl text-bold text-lime-500">hello</main>
      <Button color="primary">Save</Button>
    </div>
  );
}
