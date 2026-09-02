export type WorldPoint = { x: number; y: number };
export type WorldObstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  padding?: number;
};

/**
 * Shared world-space geometry. Every physical actor uses the same depth and
 * obstacle rules so the scene reads like one coherent 2.5D world.
 */
export function worldDepth(y: number, layer = 0) {
  return Math.round(y * 100) + layer;
}

export function distanceToWorldPoint(a: WorldPoint, b: WorldPoint) {
  return Math.hypot(a.x - b.x, (a.y - b.y) * 0.92);
}

export function insideObstacle(point: WorldPoint, obstacle: WorldObstacle) {
  const padding = obstacle.padding ?? 0;
  return point.x >= obstacle.x - obstacle.width / 2 - padding &&
    point.x <= obstacle.x + obstacle.width / 2 + padding &&
    point.y >= obstacle.y - obstacle.height / 2 - padding &&
    point.y <= obstacle.y + obstacle.height / 2 + padding;
}

/** Slide along the edge instead of stopping dead when the learner meets a building. */
export function resolveMovement(previous: WorldPoint, desired: WorldPoint, obstacles: WorldObstacle[]): WorldPoint {
  if (!obstacles.some(obstacle => insideObstacle(desired, obstacle))) return desired;

  const horizontal: WorldPoint = { x: desired.x, y: previous.y };
  if (!obstacles.some(obstacle => insideObstacle(horizontal, obstacle))) return horizontal;

  const vertical: WorldPoint = { x: previous.x, y: desired.y };
  if (!obstacles.some(obstacle => insideObstacle(vertical, obstacle))) return vertical;

  return previous;
}

export function clampWorldPoint(point: WorldPoint, minX = 6, maxX = 94, minY = 12, maxY = 91): WorldPoint {
  return {
    x: Math.max(minX, Math.min(maxX, point.x)),
    y: Math.max(minY, Math.min(maxY, point.y)),
  };
}
