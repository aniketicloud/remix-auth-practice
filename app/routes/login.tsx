import { json, redirect } from "@remix-run/node";
import type { LoaderArgs, ActionArgs } from "@remix-run/node";

import { Form, Link, useSearchParams } from "@remix-run/react";
import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  console.log(userId);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 }
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
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    redirectTo,
    remember: remember === "on" ? true : false,
    request,
    userId: user.id,
    isAdmin: user.isAdmin,
  });
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  // const actionData = useActionData<typeof action>()

  return (
    <>
      <Form method="post">
        <div>
          <label htmlFor="email">Email Address</label>
          <div>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              required
            />
            {/* implement error */}
          </div>
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            {/* implement error */}
          </div>
        </div>

        <input type="hidden" name="redirectTo" value={redirectTo} />
        <button type="submit">Log in</button>
        <div>
          <div>
            <input type="checkbox" name="remember" id="remember" />
            <label htmlFor="remember">Remember</label>
          </div>

          <div>
            Don't have an account?{" "}
            <Link to={{ pathname: "/join", search: searchParams.toString() }}>
              Sign up
            </Link>
          </div>
        </div>
      </Form>
    </>
  );
}
