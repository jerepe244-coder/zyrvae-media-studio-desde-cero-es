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
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultCommercialProps}
      />
    </>
  );
};
