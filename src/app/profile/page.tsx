"use client";

import { Button } from "@/components/ui/button";
import { signout } from "@/shared/auth.utils";

export default function Profile() {
  return (
    <div className="w-full p-8 flex flex-col justify-center items-center" >
      <div className="w-full max-w-sm flex flex-col justify-center items-center gap-8" >
        <h1 className="text-4xl" >Profile</h1>
        <Button onClick={signout} variant="destructive" className="w-full">
          Signout
        </Button>
      </div>
    </div>
  );
}