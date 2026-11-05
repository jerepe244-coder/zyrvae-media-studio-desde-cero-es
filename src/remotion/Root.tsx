import React from "react";
import { Composition } from "remotion";
import { CommercialComposition } from "./CommercialComposition";
import { defaultCommercialProps } from "./types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Commercial"
        component={CommercialComposition}
        durationInFrames={3600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultCommercialProps}
        calculateMetadata={({ props }) => {
          const duration =
            typeof props.durationInSeconds === "number"
              ? props.durationInSeconds
              : 30;
          return {
            durationInFrames: Math.max(30, Math.min(3600, Math.round(duration * 30))),
          };
        }}
      />
    </>
  );
};
