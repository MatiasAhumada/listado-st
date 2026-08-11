import assert from "node:assert/strict";
import { PLATFORM_ADMIN_SECURITY } from "@/constants/platformAdmin.constant";
import { TECHNICIAN_SECURITY } from "@/constants/technician.constant";

const BASE_URL = process.env.ADMIN_MVP_BASE_URL ?? "http://localhost:3008";
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD;
const ADMIN_USERNAME = "admin";
const CLIENT_PASSWORD = "TallerMvp-2026";
const REQUEST_TIMEOUT_MS = 15_000;

if (!ADMIN_PASSWORD) {
  throw new Error("Definí ADMIN_SEED_PASSWORD sólo para ejecutar este smoke test.");
}

function cookieFrom(response: Response, cookieName: string): string {
  const setCookie = response.headers.get("set-cookie") ?? "";
  const value = setCookie.match(new RegExp(`(?:^|,\\s*)${cookieName}=([^;,]+)`))?.[1];
  assert.ok(value, `La respuesta no creó la cookie ${cookieName}`);
  return `${cookieName}=${value}`;
}

async function request<T>(
  path: string,
  options: RequestInit & { cookie?: string } = {}
): Promise<{ response: Response; data: T }> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.cookie ? { cookie: options.cookie } : {}),
      ...options.headers,
    },
  });
  const data = (await response.json()) as T;
  assert.ok(response.ok, `${options.method ?? "GET"} ${path}: ${response.status} ${JSON.stringify(data)}`);
  return { response, data };
}

async function runAdminMvpSmoke() {
  const runId = Date.now().toString(36);
  const ownerUsername = `taller_${runId}`;

  const adminLogin = await request<{ role: string; destination: string }>("/api/auth/session", {
    method: "POST",
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
  });
  assert.equal(adminLogin.data.role, "ADMIN");
  assert.equal(adminLogin.data.destination, "/admin");
  const adminCookie = cookieFrom(adminLogin.response, PLATFORM_ADMIN_SECURITY.cookieName);

  const firstPlan = await request<{ id: string }>("/api/platform/plans", {
    method: "POST",
    cookie: adminCookie,
    body: JSON.stringify({
      name: `Plan MVP ${runId}`,
      description: "Plan creado por el smoke test fullstack",
      billingPrice: "15000.00",
      currency: "ARS",
      billingPeriod: "MONTHLY",
      isActive: true,
    }),
  });

  const secondPlan = await request<{ id: string }>("/api/platform/plans", {
    method: "POST",
    cookie: adminCookie,
    body: JSON.stringify({
      name: `Plan Pro ${runId}`,
      description: "Plan de reasignación",
      billingPrice: "26000.00",
      currency: "ARS",
      billingPeriod: "MONTHLY",
      isActive: true,
    }),
  });

  const createdWorkshop = await request<{ id: string; agreedPrice: string; subscriptionStatus: string }>(
    "/api/platform/workshops",
    {
      method: "POST",
      cookie: adminCookie,
      body: JSON.stringify({
        workshopName: `Taller MVP ${runId}`,
        ownerName: "Cliente MVP",
        ownerUsername,
        ownerPassword: CLIENT_PASSWORD,
        planId: firstPlan.data.id,
        agreedPrice: "12750.00",
        subscriptionStatus: "TRIAL",
      }),
    }
  );
  assert.equal(createdWorkshop.data.agreedPrice, "12750.00");
  assert.equal(createdWorkshop.data.subscriptionStatus, "TRIAL");

  const reassigned = await request<{ agreedPrice: string; plan: { id: string } }>(
    `/api/platform/workshops/${createdWorkshop.data.id}/subscription`,
    {
      method: "PATCH",
      cookie: adminCookie,
      body: JSON.stringify({ planId: secondPlan.data.id, agreedPrice: "21900.00" }),
    }
  );
  assert.equal(reassigned.data.plan.id, secondPlan.data.id);
  assert.equal(reassigned.data.agreedPrice, "21900.00");

  const suspended = await request<{ subscriptionStatus: string }>(
    `/api/platform/workshops/${createdWorkshop.data.id}`,
    {
      method: "PATCH",
      cookie: adminCookie,
      body: JSON.stringify({ status: "SUSPENDED" }),
    }
  );
  assert.equal(suspended.data.subscriptionStatus, "SUSPENDED");

  const reactivated = await request<{ subscriptionStatus: string }>(
    `/api/platform/workshops/${createdWorkshop.data.id}`,
    {
      method: "PATCH",
      cookie: adminCookie,
      body: JSON.stringify({ status: "ACTIVE" }),
    }
  );
  assert.equal(reactivated.data.subscriptionStatus, "TRIAL");

  await request("/api/auth/session", { method: "DELETE", cookie: adminCookie });
  const clientLogin = await request<{ role: string; destination: string }>("/api/auth/session", {
    method: "POST",
    body: JSON.stringify({ username: ownerUsername, password: CLIENT_PASSWORD }),
  });
  assert.equal(clientLogin.data.role, "CLIENT");
  assert.equal(clientLogin.data.destination, "/cliente");
  const clientCookie = cookieFrom(clientLogin.response, TECHNICIAN_SECURITY.cookieName);
  await request("/api/client/workspace", { cookie: clientCookie });
  await request("/api/auth/session", { method: "DELETE", cookie: clientCookie });

  console.log("ADMIN_MVP_SMOKE_OK");
}

runAdminMvpSmoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
