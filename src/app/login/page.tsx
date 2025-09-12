"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/shared/auth.utils";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="h-18" ></div>
      <Card className="w-full max-w-sm bg-black/0 border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-center text-4xl">
            <h3>Chart Swipe</h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center" >
          <form className="w-full flex flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input id="signin-email" name="signin-email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input id="signin-password" name="signin-password" type="password" placeholder="••••••••••••••••" required />
            </div>
            <Button formAction={login} className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}