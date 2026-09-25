import crypto from "crypto";

// Short, readable, prefixed ids (e.g. "app-3f9a1c2b") used for every
// document created at runtime, matching the style of the original seed data.
export function genId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function initialsOf(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
