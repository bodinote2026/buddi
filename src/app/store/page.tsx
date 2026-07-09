import { Header } from "@/components/layout/Header";
import { STORE_PRODUCTS } from "@/lib/mock-data";

export default function StorePage() {
  return (
    <>
      <Header title="스토어" />
      <div className="space-y-4 px-5 pb-4">
        <p className="text-[14px] text-text-secondary">
          챌린지 포인트로 웰니스 상품을 구매하세요
        </p>
        <div className="grid grid-cols-2 gap-3">
          {STORE_PRODUCTS.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]"
            >
              <div className="flex aspect-square items-center justify-center bg-primary-light text-4xl">
                {product.emoji}
              </div>
              <div className="space-y-1 p-3">
                <h3 className="text-[14px] font-semibold text-text-primary">
                  {product.name}
                </h3>
                <p className="text-[13px] font-medium text-primary">
                  {product.points.toLocaleString()}P
                </p>
                <button
                  type="button"
                  className="mt-1 flex h-10 w-full items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-white"
                >
                  교환하기
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
