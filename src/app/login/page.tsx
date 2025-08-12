import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl text-center">Masuk</CardTitle>
          <CardDescription className="text-center">
            Masukkan email Anda di bawah untuk masuk ke akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                defaultValue="admin@sekolah.id"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Kata Sandi</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">
                Masuk
              </Button>
            </Link>
            <Button variant="outline" className="w-full">
              Masuk dengan Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Belum punya akun?{" "}
            <Link href="#" className="underline">
              Daftar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
