/**
 * Landing screen shown to signed-out users. Pitches the product with an
 * animated route map — a car driving from Chicago (point A) to Boston
 * (point B) — and routes them into the login or signup flow.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { useWelcome } from "@/hooks/useWelcome";

const CAR_WIDTH = 44;
const CAR_HEIGHT = 24;
const ROAD_HEIGHT = 80;

/**
 * Side-profile car drawn entirely from Views (no emoji, no SVG) — a coral
 * body and cabin with a tinted window, two ink wheels, and a headlight,
 * facing right toward the destination.
 */
function Car() {
  return (
    <View style={{ width: CAR_WIDTH, height: CAR_HEIGHT }}>
      {/* Cabin / roof */}
      <View
        style={{
          position: "absolute",
          left: 11,
          top: 0,
          width: 22,
          height: 11,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
          backgroundColor: "#DC2626",
        }}
      />
      {/* Window */}
      <View
        style={{
          position: "absolute",
          left: 15,
          top: 3,
          width: 14,
          height: 6,
          borderRadius: 2,
          backgroundColor: "#F5F5F7",
        }}
      />
      {/* Body */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          width: CAR_WIDTH,
          height: 11,
          borderRadius: 6,
          backgroundColor: "#DC2626",
        }}
      />
      {/* Headlight */}
      <View
        style={{
          position: "absolute",
          right: 1,
          top: 11,
          width: 3,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: "#FDE68A",
        }}
      />
      {/* Wheels */}
      {[7, 27].map((left) => (
        <View
          key={left}
          style={{
            position: "absolute",
            left,
            top: 13,
            width: 11,
            height: 11,
            borderRadius: 6,
            backgroundColor: "#0A0A0A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#6B7076" }}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * Animated map showing a car looping along the road from Chicago to Boston.
 * Uses the built-in Animated API so it works without any native SVG/maps deps.
 */
function RouteMap() {
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(700),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(700),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  // Build the zigzag polyline from Chicago (A) to Boston (B). Everything the
  // animation needs — the car's x/y offsets, its heading at each waypoint, and
  // the dots that draw the dashed road — is derived from these waypoints.
  const geo = useMemo(() => {
    const pad = 8;
    const usable = Math.max(trackWidth - pad * 2, 1);
    const yHi = 18;
    const yLo = ROAD_HEIGHT - 18;
    const fr = [0, 0.22, 0.44, 0.66, 0.88, 1];
    const ys = [yLo, yHi, yLo, yHi, yLo, yHi];
    const pts = fr.map((f, i) => ({ x: pad + f * usable, y: ys[i] }));

    const segLen: number[] = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const len = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
      segLen.push(len);
      total += len;
    }
    const inputRange: number[] = [0];
    let acc = 0;
    for (let i = 0; i < segLen.length; i++) {
      acc += segLen[i];
      inputRange.push(acc / total);
    }

    // Car offsets so its center rides the path; heading = slope of the
    // upcoming segment (last waypoint reuses the final segment).
    const outX = pts.map((p) => p.x - CAR_WIDTH / 2);
    const outY = pts.map((p) => p.y - CAR_HEIGHT / 2);
    const rot = pts.map((_, i) => {
      const j = Math.min(i, pts.length - 2);
      const deg = (Math.atan2(pts[j + 1].y - pts[j].y, pts[j + 1].x - pts[j].x) * 180) / Math.PI;
      return `${deg}deg`;
    });

    // Sample the polyline into dots for the dashed road.
    const dots: { x: number; y: number }[] = [];
    for (let s = 0; s < pts.length - 1; s++) {
      const n = Math.max(1, Math.round(segLen[s] / 8));
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        dots.push({
          x: pts[s].x + (pts[s + 1].x - pts[s].x) * t,
          y: pts[s].y + (pts[s + 1].y - pts[s].y) * t,
        });
      }
    }

    return { start: pts[0], end: pts[pts.length - 1], inputRange, outX, outY, rot, dots };
  }, [trackWidth]);

  const translateX = progress.interpolate({ inputRange: geo.inputRange, outputRange: geo.outX });
  const translateY = progress.interpolate({ inputRange: geo.inputRange, outputRange: geo.outY });
  const rotate = progress.interpolate({ inputRange: geo.inputRange, outputRange: geo.rot });

  return (
    <View className="rounded-3xl border border-line bg-cream-2 px-5 py-6">
      {/* Endpoint labels */}
      <View className="mb-4 flex-row items-start justify-between">
        <View>
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-sage">
            Point A
          </Text>
          <Text className="text-lg font-semibold text-ink">Chicago</Text>
        </View>
        <View className="items-end">
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-coral">
            Point B
          </Text>
          <Text className="text-lg font-semibold text-ink">Boston</Text>
        </View>
      </View>

      {/* Zigzag road with the moving car */}
      <View
        style={{ height: ROAD_HEIGHT }}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        {/* Dashed road — dots sampled along the zigzag polyline */}
        {geo.dots.map((d, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: d.x - 1.5,
              top: d.y - 1.5,
              width: 3,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: "#C7CBD1",
            }}
          />
        ))}
        {/* Start marker (Chicago) */}
        <View
          style={{ position: "absolute", left: geo.start.x - 8, top: geo.start.y - 8 }}
          className="h-4 w-4 rounded-full border-2 border-cream bg-sage"
        />
        {/* Destination marker (Boston) */}
        <View
          style={{ position: "absolute", left: geo.end.x - 8, top: geo.end.y - 8 }}
          className="h-4 w-4 rounded-full border-2 border-cream bg-coral"
        />
        {/* The car driving A → B, banking into each turn */}
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: CAR_WIDTH,
            height: CAR_HEIGHT,
            transform: [{ translateX }, { translateY }, { rotate }],
          }}
        >
          <Car />
        </Animated.View>
      </View>
    </View>
  );
}

export function WelcomeScreen() {
  const { goToSignup, goToLogin } = useWelcome();

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 justify-between px-6 py-6">
        {/* Header */}
        <View>
          <Logo tone="ink" />
        </View>

        {/* Center: pitch, route map, and the sign-in CTA */}
        <View className="gap-7">
          <View>
            <Text className="mb-3 text-xs uppercase tracking-widest text-muted">
              ·001 · students only
            </Text>
            <Text className="text-4xl font-semibold leading-tight text-ink">
              Student community - Get a ride by your school friends!
            </Text>
          </View>

          <RouteMap />

          <View className="gap-3">
            <Button label="Sign in" variant="ink" onPress={goToLogin} />
            <Pressable onPress={goToSignup} className="py-2">
              <Text className="text-center text-sm text-muted">
                New here?{" "}
                <Text className="font-semibold text-ink">Create an account</Text>
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <Text className="text-center text-xs text-muted">
          Verified .edu · real names · real reviews
        </Text>
      </View>
    </SafeAreaView>
  );
}
