import type { LoaderArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  // TODO: add logic to add for dashboard page like list of users or some graph
  return userId;
}

export default function Dashboard() {
  return (
    <>
      <h1>Dashboard Page</h1>
      <Form action="/logout" method="post">
        <button type="submit">Logout</button>
      </Form>
    </>
  );
}
