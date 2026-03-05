import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md space-y-6 text-center px-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-6">
            <ShieldX className="h-16 w-16 text-red-500" />
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-extrabold text-gray-900">403</h1>
          <h2 className="mt-2 text-2xl font-semibold text-gray-700">
            Yetkisiz Erişim
          </h2>
          <p className="mt-3 text-gray-500 leading-relaxed">
            Bu sayfaya erişim yetkiniz bulunmamaktadır. Eğer bu bir hata olduğunu
            düşünüyorsanız lütfen sistem yöneticinizle iletişime geçin.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
