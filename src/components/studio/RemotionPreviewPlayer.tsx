"use client";

import React from "react";
import { Player } from "@remotion/player";
import { CommercialComposition } from "@/remotion/CommercialComposition";
import { CommercialProps, defaultCommercialProps } from "@/remotion/types";

interface RemotionPreviewPlayerProps {
  props: CommercialProps;
  durationInSeconds?: number;
}

export default function RemotionPreviewPlayer({
  props,
  durationInSeconds = 10,
}: RemotionPreviewPlayerProps) {
  const durationInFrames = Math.max(30, Math.min(3600, Math.round(durationInSeconds * 30)));

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black rounded-[32px]">
      <Player
        component={CommercialComposition}
        inputProps={{
          ...defaultCommercialProps,
          ...props,
        }}
        durationInFrames={durationInFrames}
        compositionWidth={1080}
        compositionHeight={1920}
        fps={30}
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          aspectRatio: "9 / 16",
        }}
        controls
        autoPlay
        loop
      />
    </div>
  );
}
