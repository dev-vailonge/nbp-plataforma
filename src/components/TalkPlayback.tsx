"use client";

import { useState } from "react";
import { Fa } from "@/components/BrandMark";

type Media =
  | { kind: "youtube" | "vimeo"; src: string }
  | { kind: "video" | "audio"; src: string };

export function describeMedia(url: string): Media {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
  );
  if (youtube) {
    return { kind: "youtube", src: `https://www.youtube.com/embed/${youtube[1]}?autoplay=1` };
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return { kind: "vimeo", src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };
  }
  if (/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url)) return { kind: "video", src: url };
  return { kind: "audio", src: url };
}

export function TalkPlayButton({
  label,
  playing,
  onClick,
  className,
}: {
  label: string;
  playing: boolean;
  onClick: () => void;
  className: string;
}) {
  return (
    <button type="button" aria-label={label} aria-pressed={playing} onClick={onClick} className={className}>
      <Fa name={playing ? "fa-pause" : "fa-play"} className={playing ? "" : "ml-0.5"} />
    </button>
  );
}

export function TalkMedia({ url }: { url: string }) {
  const media = describeMedia(url);
  const [failed, setFailed] = useState(false);

  if (media.kind === "youtube" || media.kind === "vimeo") {
    return (
      <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-black">
        <iframe
          title="Episódio"
          src={media.src}
          className="h-full w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (failed) {
    return (
      <p className="mt-3 mb-0 text-[0.82rem] text-nbp-tx2">
        Este link não reproduz aqui.{" "}
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-nbp-salvia underline">
          Abrir o episódio
        </a>
      </p>
    );
  }

  if (media.kind === "video") {
    return (
      <video
        className="mt-3 w-full rounded-xl bg-black"
        src={media.src}
        controls
        autoPlay
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <audio className="mt-3 w-full" src={media.src} controls autoPlay onError={() => setFailed(true)} />
  );
}

export function missingTalkMessage() {
  return "Ainda sem link. O play passa a abrir o episódio quando o admin colar o URL.";
}
