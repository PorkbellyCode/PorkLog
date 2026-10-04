import Image from "next/image";
import type { ProjectImage } from "@/lib/projects";

// 스크린샷은 라이트/다크 한 벌로 고정이라, 어떤 테마에서도 같은 어두운 프레임에 담는다.
// 다크 배경(#0d0d0d) 위에서 윤곽이 사라지지 않도록 다크 모드에서만 테두리를 밝힌다.
const FRAME = "overflow-hidden border border-border-default bg-[#1f2328] dark:border-white/20";

function Caption({ children }: { children?: string }) {
  if (!children) return null;
  return <figcaption className="mt-2.5 text-sm leading-relaxed text-fg-muted">{children}</figcaption>;
}

// 데스크톱 화면: 사이트 헤더와 같은 #1f2328 막대를 얹은 브라우저 프레임.
function BrowserShot({ image, sizes }: { image: ProjectImage; sizes: string }) {
  return (
    <figure>
      <div className={`${FRAME} rounded-lg`}>
        <div className="flex h-6 items-center gap-1.5 px-3" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-white/25" />
          <span className="h-2 w-2 rounded-full bg-white/25" />
          <span className="h-2 w-2 rounded-full bg-white/25" />
        </div>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          className="block h-auto w-full"
        />
      </div>
      <Caption>{image.caption}</Caption>
    </figure>
  );
}

// 세로로 긴 모바일 화면: 얇은 베젤을 두른 폰 프레임.
function PhoneShot({ image }: { image: ProjectImage }) {
  return (
    <figure>
      <div className={`${FRAME} rounded-3xl border-[5px]`}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 30vw, 50vw"
          className="block h-auto w-full"
        />
      </div>
      <Caption>{image.caption}</Caption>
    </figure>
  );
}

// 가로·세로 스크린샷이 섞여도 어색하지 않게 방향별로 나눠 배치한다.
//  - 가로: 홀수 장이면 첫 장을 전체 폭으로, 나머지는 2열. 짝수 장이면 모두 2열.
//  - 세로: 한 장이면 캡션을 옆에, 여러 장이면 열로 나란히.
// 0장이면 준비 중 표시.
export default function ProjectGallery({ images }: { images: ProjectImage[] }) {
  if (images.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border-default px-4 py-10 text-center text-sm text-fg-muted">
        스크린샷을 준비하고 있습니다.
      </p>
    );
  }

  const landscape = images.filter((i) => i.width >= i.height);
  const portrait = images.filter((i) => i.width < i.height);
  const hasHero = landscape.length % 2 === 1;
  // 첫 이미지(대표)가 세로면 세로 묶음을 먼저 보여준다.
  const phonesFirst = images[0].width < images[0].height;

  const landscapeBlock = landscape.length > 0 && (
    <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
      {landscape.map((image, i) => (
        <div key={image.src} className={hasHero && i === 0 ? "sm:col-span-2" : undefined}>
          <BrowserShot
            image={image}
            sizes={
              hasHero && i === 0
                ? "(min-width: 1024px) 992px, 100vw"
                : "(min-width: 1024px) 486px, (min-width: 640px) 50vw, 100vw"
            }
          />
        </div>
      ))}
    </div>
  );

  const portraitBlock =
    portrait.length === 1 ? (
      <div className="flex items-start gap-5">
        <div className="w-32 shrink-0 sm:w-48">
          <PhoneShot image={{ ...portrait[0], caption: undefined }} />
        </div>
        <p className="min-w-0 pt-1 text-sm leading-relaxed text-fg-muted">{portrait[0].caption}</p>
      </div>
    ) : portrait.length > 1 ? (
      <div
        className={`grid grid-cols-2 gap-5 ${portrait.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}
      >
        {portrait.map((image) => (
          <PhoneShot key={image.src} image={image} />
        ))}
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      {phonesFirst ? portraitBlock : landscapeBlock}
      {phonesFirst ? landscapeBlock : portraitBlock}
    </div>
  );
}
