import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const h = request.headers;
  const city = h.get("x-vercel-ip-city");

  console.log(
    JSON.stringify({
      event: "visit",
      at: new Date().toISOString(),
      path: request.nextUrl.pathname,
      src: request.nextUrl.searchParams.get("src"),
      ip: h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0],
      country: h.get("x-vercel-ip-country"),
      region: h.get("x-vercel-ip-country-region"),
      city: city ? decodeURIComponent(city) : null,
      postalCode: h.get("x-vercel-ip-postal-code"),
      lat: h.get("x-vercel-ip-latitude"),
      lon: h.get("x-vercel-ip-longitude"),
      timezone: h.get("x-vercel-ip-timezone"),
      userAgent: h.get("user-agent"),
      referer: h.get("referer"),
    }),
  );

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
