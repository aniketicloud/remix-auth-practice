import { ActionArgs, json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { validateEmail } from "~/utils";

export default function Signup() {
  return (
    <Form method="post">
      <div>
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          defaultValue="aniket@gmail.com"
          autoFocus={true}
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
          autoFocus={true}
        />
      </div>
      <input type="hidden" name="redirectTo" value="add implementation" />
      <button>Sign Up</button>
    </Form>
  );
}

export const action = async ({ request }: ActionArgs) => {
  // console.log(request);
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

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

  // const existingUser = await 

  return null;
};
