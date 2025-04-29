// app/components/NavBar.tsx (o /components/NavBar.tsx)
"use client";

import Image from "next/image";
import Link from "next/link";
// import cart from "./cart"; // Asegurate de crearlo luego o comentarlo por ahora

export default function NavBar() {
  return (
    <nav className="py-3 px-12 flex justify-between bg-white dark:bg-neutral-900">
        <Link href="/">
            <Image
                src="/logo_orange_on_transparent.png"
                width={40}
                height={40}
                alt="inicio"
            />
        </Link>
      <button className="relative">
        <Image
            src="/cart.svg"
            width={40}
            height={40}
            alt="shopping cart icon"
            className="dark:invert"
        />
        <div className="rounded-full flex justify-center items-center bg-orange-600 text-xs text-white absolute w-6 h-5 bottom-6 -right-1">
          0
        </div>
      </button>
      {/* <ShoppingCart /> si todavía no existe, comentalo para evitar error */}
    </nav>
  );
}