import * as GiIcons from "react-icons/gi";

export const AVATAR_COLORS = [
  "#5B8DEF", "#7C5CE7", "#E85D75", "#F28C4B", "#E5B83B", "#56B870",
  "#2FB7A8", "#2F9BD8", "#9B59B6", "#D96CBE", "#8B6F47", "#5F6B7A",
];

export const AVATAR_ICON_NAMES = [
  "GiLion", "GiFox", "GiPanda", "GiRabbit", "GiOwl", "GiTurtle", "GiOctopus", "GiSharkFin",
  "GiDragonHead", "GiDinosaurBones", "GiUnicorn", "GiRobotGolem", "GiAstronautHelmet", "GiRocket",
  "GiCrownedSkull", "GiCrown", "GiShield", "GiSoccerBall", "GiBasketballBall", "GiTennisRacket",
  "GiLightningTrio", "GiStarSwirl", "GiFire", "GiCrystalBall", "GiPirateFlag", "GiNinjaHeroicStance",
  "GiWizardStaff", "GiKnightBanner", "GiPlanetCore", "GiCometSpark",
].filter((name) => typeof GiIcons[name] === "function");

export const DEFAULT_AVATAR_ICON = AVATAR_ICON_NAMES[0] || "GiAbstract050";
export const DEFAULT_AVATAR_COLOR = "#5B8DEF";

export const AVATARS = AVATAR_ICON_NAMES.map((name) => [name, GiIcons[name]]);

export function normalizeAvatar(icon, color) {
  return {
    icon: AVATAR_ICON_NAMES.includes(icon) ? icon : DEFAULT_AVATAR_ICON,
    color: AVATAR_COLORS.includes(color) ? color : DEFAULT_AVATAR_COLOR,
  };
}

export function avatarComponent(name) {
  return GiIcons[name] || GiIcons[DEFAULT_AVATAR_ICON] || GiIcons.GiAbstract050;
}
