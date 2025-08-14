"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";
import { auth } from "@/lib/auth";
import { CgBoy } from "@/components/cg-boy";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nextUrl = searchParams?.get("next") || "/dashboard";

  useEffect(() => {
    let ignore = false;
    async function checkLoggedIn() {
      try {
        if (!auth.token) return;
        await authAPI.me();
        if (!ignore) router.replace(nextUrl);
      } catch (e) {
        // ignore
      }
    }
    checkLoggedIn();
    return () => {
      ignore = true;
    };
  }, [router, nextUrl]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ username, password });
      if (res.data?.success) {
        const { token, user } = res.data.data;
        auth.token = token;
        auth.user = user;
        toast({
          title: "Login berhasil",
          description: `Selamat datang, ${user.full_name || user.username}`,
        });
        router.push(nextUrl);
      } else {
        toast({
          title: "Login gagal",
          description: res.data?.message || "Periksa kredensial Anda",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Login gagal",
        description: e.response?.data?.message || e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your username below to login to your account
            </p>
          </div>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <div className="flex h-full w-full items-center justify-center">
          <CgBoy className="h-96 w-96" />
        </div>
      </div>
    </div>
  );
}
