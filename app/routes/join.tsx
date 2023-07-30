import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useSearchParams } from "@remix-run/react";
import { createUser, getUserByEmail } from "~/models/user.server";
import { getIsAdmin } from "~/session.server";
import { validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const isAdmin = await getIsAdmin(request);
  if (!isAdmin) return redirect("/");
  return json({});
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  return (
    <Form method="post">
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue="Aniket"
          autoFocus={true}
        />
      </div>
      <div>
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          defaultValue="aniket@gmail.com"
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          defaultValue="11111111"
        />
      </div>
      <div>
        <label htmlFor="isAdmin">Is this an Admin ?</label>
        <input
          type="checkbox"
          name="isAdmin"
          id="isAdmin"
          defaultChecked={false}
        />
      </div>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <button>Sign Up</button>
    </Form>
  );
}

export const action = async ({ request }: ActionArgs) => {
  const isLoggedInUserAdmin = await getIsAdmin(request);
  if (!isLoggedInUserAdmin) {
    return json(
      {
        errors: {
          email: null,
          password: null,
          access: "You do not have the access to create a user",
        },
      },
      { status: 400 },
    );
  }
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name") as string;
  const isAdmin = !!formData.get("isAdmin");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 },
    );
  }

  // regex is true if string has empty space
  if (!/^\S{3,}$/.test(password)) {
    return json(
      {
        errors: {
          email: null,
          password: "Password cannot contain a whitespace",
        },
      },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: "A user already exists with this email",
          password: null,
        },
      },
      { status: 400 },
    );
  }

  const user = createUser({ email, password, name, isAdmin });

  return user;
};
