import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

interface PostFXProps {
  highQuality: boolean;
}

export function PostFX({ highQuality }: PostFXProps) {
  if (!highQuality) return null;

  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom intensity={0.9} luminanceThreshold={0.35} luminanceSmoothing={0.25} mipmapBlur />
      <Vignette eskil={false} offset={0.25} darkness={0.6} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.06} />
    </EffectComposer>
  );
}
