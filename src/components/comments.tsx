"use client";

import Giscus from "@giscus/react";

export default function Comments() {
  return (
    <Giscus
      repo="PorkbellyCode/PorkLog"
      repoId="R_kgDOSkixxg"
      category="Announcements"
      categoryId="DIC_kwDOSkixxs4C97_r"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme="light"
      lang="ko"
      loading="lazy"
    />
  );
}