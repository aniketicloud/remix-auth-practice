import { Form } from "@remix-run/react";

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
