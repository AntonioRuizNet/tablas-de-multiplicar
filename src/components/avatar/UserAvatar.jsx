import React from "react";
import PropTypes from "prop-types";
import { avatarComponent, normalizeAvatar } from "../../lib/avatars";
import styles from "./UserAvatar.module.css";

export function UserAvatar({ icon, color, size = 40, className = "" }) {
  const avatar = normalizeAvatar(icon, color);
  const Icon = avatarComponent(avatar.icon);
  return (
    <span className={`${styles.avatar} ${className}`} style={{ width: size, height: size, color: avatar.color }} aria-hidden="true">
      <Icon size={Math.round(size * 0.62)} />
    </span>
  );
}

UserAvatar.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
};
