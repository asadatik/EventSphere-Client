// middleware.js

import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const middleware = async (request) => {
  const cookieStore = cookies();
  const pathname = request.nextUrl.pathname;
  console.log("path name is ", pathname);

  // API routes skip
  if (pathname.includes("api")) {
    return NextResponse.next();
  }

  // NextAuth cookie: dev + prod 
  const devToken = cookieStore.get("next-auth.session-token");
  const prodToken = cookieStore.get("__Secure-next-auth.session-token");
  const token = devToken || prodToken;

  if (!token) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${pathname}`, request.url)
    );
  }

  // myEmail cookie safe 
  const myEmailCookie = cookieStore.get("myEmail");
  const myEmail = myEmailCookie?.value;

  if (!myEmail) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${pathname}`, request.url)
    );
  }

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_UR ||
    "https://eventsphare-server-psun.onrender.com"; 

  let role;

  try {
    const { data } = await axios.get(`${BACKEND_URL}/user/${myEmail}`);
    role = data?.role;
    console.log("current user role is ", role);
  } catch (e) {
    console.error("middleware role fetch error:", e?.message);
    return NextResponse.redirect(
      new URL(`/login?redirect=${pathname}`, request.url)
    );
  }

  // ===== Role-based Guards =====

  // শুধু normal user allowed
  if (
    (pathname === "/dashboard/be-organizer" ||
      pathname === "/dashboard/my-orderlist") &&
    role !== "user"
  ) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${pathname}&error=access_denied`, request.url)
    );
  }

  // শুধু organizer allowed
  if (
    pathname === "/dashboard/booked-event" ||
    pathname === "/dashboard/eventPost" ||
    pathname === "/dashboard/organizer-container" ||
    pathname === "/dashboard/organizer-profit"
  ) {
    if (role !== "organizer") {
      return NextResponse.redirect(
        new URL(
          `/login?redirect=${pathname}&error=access_denied`,
          request.url
        )
      );
    }
  }

  // শুধু admin allowed
  if (
    pathname === "/dashboard/admin-container" ||
    pathname === "/dashboard/organizer-request" ||
    pathname === "/dashboard/user-manage"
  ) {
    if (role !== "admin") {
      return NextResponse.redirect(
        new URL(
          `/login?redirect=${pathname}&error=access_denied`,
          request.url
        )
      );
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/dashboard/:path*"],
};
