"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Divider, Flex } from "@aws-amplify/ui-react";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Hub } from "aws-amplify/utils";
import { fetchAuthSession } from "aws-amplify/auth";

export default function NavBar({ isSignedIn }: { isSignedIn: boolean }) {
  const [authCheck, setAuthCheck] = useState<boolean>(isSignedIn);
  const [adminCheck, setAdminCheck] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const hubListenerCancel = Hub.listen("auth", (data) => {
      switch (data.payload.event) {
        case "signedIn":
          setAuthCheck(true);
          router.push("/");
          break;
        case "signedOut":
          setAuthCheck(false);
          router.push("/");
          break;
      }
    });

    return () => {
      hubListenerCancel();
    };
  }, [router]);

  useEffect(() => {
    const checkAdmin = async () => {
      let isAdmin = false;
      try {
        const session = await fetchAuthSession();
        const tokens = session.tokens;
        if (tokens && Object.keys(tokens).length > 0) {
          const groups = tokens.accessToken.payload["cognito:groups"];
          if (Array.isArray(groups) && groups.includes("Admins")) {
            isAdmin = true;
          }
        }
      } catch (error) {
        isAdmin = false;
      } finally {
        setAdminCheck(isAdmin);
      }
    };

    if (authCheck) {
      checkAdmin();
    } else {
      setAdminCheck(false);
    }
  }, [authCheck]);

  const signOutSignIn = async () => {
    if (authCheck) {
      await signOut();
    } else {
      router.push("/signin");
    }
  };

  const defaultRoutes = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/create-product",
      label: "Add Product",
      isAdmin: true,
    },
  ];

  const routes = defaultRoutes.filter((route) => {
    return route.isAdmin === adminCheck || route.isAdmin === undefined;
  });

  return (
    <>
      <Flex
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="1rem"
      >
        <Flex as="nav" alignItems="center" gap="3rem" margin="0 2rem">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              {route.label}
            </Link>
          ))}
        </Flex>
        <Flex alignItems="center">
          {adminCheck && <Link href="/admin">Admin</Link>}
        </Flex>
        <Button
          variation="primary"
          borderRadius="2rem"
          className="mr-4"
          onClick={signOutSignIn}
        >
          {authCheck ? "Sign Out" : "Sign In"}
        </Button>
      </Flex>
      <Divider size="small"></Divider>
    </>
  );
}
