// src/components/avatar/AvatarPicker.jsx

import { useState } from "react";
import Avatar from "./Avatar";
import { avatarStyles } from "./avatarStyles";

const AvatarPicker = ({ username = "Guest", onSelect }) => {
  const [selectedStyle, setSelectedStyle] = useState("lorelei");

  const handleSelect = (style) => {
    setSelectedStyle(style);

    if (onSelect) {
      onSelect({
        style,
        seed: username,
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-white text-lg font-semibold">
        Choose Your Avatar
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {avatarStyles.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item.id)}
            className={`p-3 rounded-xl border transition-all duration-300
              ${
                selectedStyle === item.id
                  ? "border-cyan-400 bg-cyan-500/10"
                  : "border-gray-700 hover:border-cyan-500"
              }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Avatar
                seed={username}
                style={item.id}
                size={70}
              />

              <span className="text-sm text-gray-300">
                {item.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-4">
        <h3 className="text-gray-400 text-sm mb-2">
          Preview
        </h3>

        <div className="flex items-center gap-3 bg-[#0b1220] p-4 rounded-xl border border-gray-800">
          <Avatar
            seed={username}
            style={selectedStyle}
            size={60}
          />

          <div>
            <p className="text-white font-medium">
              {username}
            </p>

            <p className="text-gray-400 text-sm">
              DevResilience Member
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarPicker;