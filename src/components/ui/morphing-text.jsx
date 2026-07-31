import { useCallback, useEffect, useRef } from "react";

const morphTime = 0.8;
const cooldownTime = 0.7;

function useMorphingText(texts) {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef(null);
  const text2Ref = useRef(null);

  const setStyles = useCallback(
    (fraction) => {
      const current1 = text1Ref.current;
      const current2 = text2Ref.current;

      if (!current1 || !current2) return;

      // incoming text
      current2.style.filter = `blur(${Math.min(
        3 / fraction - 3,
        12
      )}px)`;

      current2.style.opacity = `${Math.pow(fraction, 0.45) * 100}%`;

      const invertedFraction = 1 - fraction;

      // outgoing text
      current1.style.filter = `blur(${Math.min(
        3 / invertedFraction - 3,
        12
      )}px)`;

      current1.style.opacity = `${Math.pow(
        invertedFraction,
        0.45
      ) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent =
        texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts]
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;

    const current1 = text1Ref.current;
    const current2 = text2Ref.current;

    if (current1 && current2) {
      current2.style.filter = "none";
      current2.style.opacity = "100%";

      current1.style.filter = "none";
      current1.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt =
        (newTime.getTime() - timeRef.current.getTime()) / 1000;

      timeRef.current = newTime;
      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) {
        doMorph();
      } else {
        doCooldown();
      }
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [doMorph, doCooldown]);

  return { text1Ref, text2Ref };
}

function Texts({ texts }) {
  const { text1Ref, text2Ref } = useMorphingText(texts);

  return (
    <div className="morph-text-container">
      <span className="morph-text invisible">{texts[0]}</span>

      <span ref={text1Ref} className="morph-text layer" />
      <span ref={text2Ref} className="morph-text layer" />
    </div>
  );
}

function SvgFilters() {
  return (
    <svg
      id="filters"
      className="svg-filter"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="threshold">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 255 -140
            "
          />
        </filter>
      </defs>
    </svg>
  );
}

export default function MorphingText({ texts, className = "" }) {
  return (
    <div className={`morph-wrapper ${className}`}>
      <Texts texts={texts} />
      <SvgFilters />
    </div>
  );
}