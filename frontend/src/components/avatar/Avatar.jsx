// src/components/avatar/Avatar.jsx

import { createAvatar } from "@dicebear/core";

import {
  lorelei,
  bottts,
  adventurer,
  shapes,
  thumbs,
} from "@dicebear/collection";

const stylesMap = {
  lorelei,
  bottts,
  adventurer,
  shapes,
  thumbs,
};

const Avatar = ({
  seed = "Guest",
  style = "lorelei",
  size = 50,
  className = "",
}) => {
  const selectedStyle = stylesMap[style] || stylesMap["lorelei"];
  const avatar = createAvatar(selectedStyle, {
    seed: seed || "Guest",
  }).toDataUri();

  return (
    <img
      src={avatar}
      alt="avatar"
      width={size}
      height={size}
      className={`rounded-full border border-cyan-500 ${className}`}
    />
  );
};

export default Avatar;