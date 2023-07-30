import type { V2_MetaFunction } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const user = useOptionalUser();
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1 className="text-xl text-blue-900 font-bold underline">
        Welcome to our landing page!
      </h1>
      {user ? (
        <div>
          <Link to="/dashboard">View your Dsahboard</Link>
          <Form action="/logout" method="post">
            <button type="submit">Logout</button>
          </Form>
        </div>
      ) : (
        <div>
          <Link
            to="/login"
            className="flex items-center justify-center bg-yellow-500 text-white rounded-md py-3 font-medium px-4"
          >
            Login
          </Link>
        </div>
      )}
    </main>
  );
}
