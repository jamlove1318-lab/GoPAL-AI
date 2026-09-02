import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { getWorldVehicles, getWorldVehicleRoutes, WorldVehicleDefinition } from '../data/livingWorldVehicles';
import { worldDepth } from '../geometry/livingWorldGeometry';

export function LivingVehicleLayer({ locationId = 'emerald-village' }: { locationId?: string }) {
  const vehicles = getWorldVehicles(locationId);
  const routes = getWorldVehicleRoutes(locationId);
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {vehicles.map(vehicle => <Vehicle key={vehicle.id} vehicle={vehicle} route={vehicle.routeId ? routes.find(item => item.id === vehicle.routeId) : undefined} />)}
  </View>;
}

function Vehicle({ vehicle, route }: { vehicle: WorldVehicleDefinition; route?: ReturnType<typeof getWorldVehicleRoutes>[number] }) {
  const initial = route?.waypoints?.[0] ?? { x: vehicle.x, y: vehicle.y };
  const position = useRef(new Animated.ValueXY(initial)).current;
  const angle = useRef(new Animated.Value(vehicle.rotation ?? 0)).current;
  const waypoints = useMemo(() => route?.waypoints ?? [], [route]);

  useEffect(() => {
    if (!vehicle.moving || waypoints.length < 2) return;
    let cancelled = false;
    let index = 0;

    const move = () => {
      if (cancelled) return;
      const current = waypoints[index % waypoints.length];
      const nextIndex = index + 1;
      const next = waypoints[nextIndex % waypoints.length];
      const distance = Math.hypot(next.x - current.x, next.y - current.y);
      const duration = Math.max(900, Math.round(distance * 180 / Math.max(0.1, route?.speed ?? vehicle.speed ?? 0.3)));
      const direction = Math.atan2(next.y - current.y, next.x - current.x) * 180 / Math.PI;
      position.setValue(current);
      angle.setValue(direction);

      Animated.timing(position, {
        toValue: next,
        duration,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (!finished || cancelled) return;
        index = nextIndex;
        const waitMs = Math.max(0, next.waitMs ?? 0);
        if (!route?.loop && index >= waypoints.length - 1) return;
        if (waitMs > 0) {
          setTimeout(() => { if (!cancelled) move(); }, waitMs);
        } else {
          move();
        }
      });
    };

    move();
    return () => {
      cancelled = true;
      position.stopAnimation();
      angle.stopAnimation();
    };
  }, [angle, position, route, vehicle.moving, vehicle.speed, waypoints]);

  const translateX = position.x.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: 'extend' });
  const translateY = position.y.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: 'extend' });
  const size = 34 * (vehicle.scale ?? 1);
  const dynamicDepth = position.y.interpolate({
    inputRange: [0, 100],
    outputRange: [worldDepth(0, 70), worldDepth(100, 70)],
    extrapolate: 'clamp',
  });

  return <Animated.View style={[styles.vehicle, {
    width: size,
    height: size,
    marginLeft: -size / 2,
    marginTop: -size / 2,
    zIndex: dynamicDepth as unknown as number,
    left: '0%',
    top: '0%',
    transform: [
      { translateX: Animated.multiply(translateX, 400) },
      { translateY: Animated.multiply(translateY, 800) },
      { rotate: angle.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] }) },
    ],
  }]}>
    <VehicleArt kind={vehicle.kind} />
  </Animated.View>;
}

function VehicleArt({ kind }: { kind: WorldVehicleDefinition['kind'] }) {
  if (kind === 'train') return <Svg width="100%" height="100%" viewBox="0 0 40 40"><Ellipse cx="20" cy="35" rx="15" ry="3" fill="#0f172a" opacity=".3"/><Rect x="7" y="7" width="26" height="23" rx="5" fill="#7c3aed"/><Rect x="11" y="11" width="18" height="9" rx="2" fill="#dbeafe"/><Circle cx="13" cy="30" r="3" fill="#1e293b"/><Circle cx="27" cy="30" r="3" fill="#1e293b"/></Svg>;
  if (kind === 'bus') return <Svg width="100%" height="100%" viewBox="0 0 40 40"><Ellipse cx="20" cy="34" rx="15" ry="3" fill="#0f172a" opacity=".3"/><Rect x="6" y="8" width="28" height="22" rx="6" fill="#0f766e"/><Rect x="10" y="12" width="20" height="8" rx="2" fill="#dbeafe"/><Circle cx="12" cy="30" r="3" fill="#1e293b"/><Circle cx="28" cy="30" r="3" fill="#1e293b"/></Svg>;
  if (kind === 'airplane') return <Svg width="100%" height="100%" viewBox="0 0 40 40"><Ellipse cx="20" cy="34" rx="13" ry="2.5" fill="#0f172a" opacity=".2"/><Path d="M20 4L24 17L36 23L24 25L20 36L16 25L4 23L16 17Z" fill="#e2e8f0"/><Path d="M20 8V32" stroke="#64748b" strokeWidth="2"/></Svg>;
  if (kind === 'boat') return <Svg width="100%" height="100%" viewBox="0 0 40 40"><Path d="M6 23L10 31H30L34 23Z" fill="#0f766e"/><Path d="M20 8V23H31L20 13Z" fill="#f8fafc"/></Svg>;
  return <Svg width="100%" height="100%" viewBox="0 0 40 40"><Circle cx="20" cy="20" r="9" fill="#475569"/><Circle cx="10" cy="30" r="5" fill="#1e293b"/><Circle cx="30" cy="30" r="5" fill="#1e293b"/><Path d="M13 17L27 17" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round"/></Svg>;
}

const styles = StyleSheet.create({ vehicle: { position: 'absolute' }, });
