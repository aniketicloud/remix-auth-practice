import { json, redirect } from "@remix-run/node";
import type { LoaderArgs, ActionArgs, V2_MetaFunction } from "@remix-run/node";

import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useRef } from "react";
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

export const meta: V2_MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Form method="post">
        <div>
          <label htmlFor="email">Email Address</label>
          <div>
            <input
              ref={emailRef}
              id="email"
              required
              autoFocus={true}
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby="email-error"
            />
            {actionData?.errors?.email ? (
              <div className="error-class">{actionData.errors.email}</div>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <div>
            <input
              id="password"
              ref={passwordRef}
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby="password-error"
              required
            />
            {actionData?.errors?.password ? (
              <div className="error-class">{actionData.errors.password}</div>
            ) : null}
          </div>
        </div>

        <input type="hidden" name="redirectTo" value={redirectTo} />
        <button type="submit">Log in</button>
        <div>
          <div>
            <input id="remember" name="remember" type="checkbox" />
            <label htmlFor="remember">Remember me</label>
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
