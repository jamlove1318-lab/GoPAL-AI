import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MessageCircle, X } from 'lucide-react-native';
import { CassidyCharacter } from '../../../components/CassidyCharacter';
import {
  CassidyPresenceContext,
  resolveCassidyWorldPresence,
} from '../../../engines/cassidy/cassidyWorldPresenceEngine';
import { resolveCassidySceneAnchor } from '../../../engines/cassidy/cassidySceneAnchorEngine';

interface Props {
  languageCode?: string;
  context?: CassidyPresenceContext;
  locationLabel?: string;
}

/** Cassidy belongs inside the current world scene. The same companion travels
 * across language worlds, while her position and body language adapt to place.
 */
export function LivingCassidyPresence({
  languageCode = 'ja',
  context = 'exploring',
  locationLabel,
}: Props) {
  const presence = useMemo(
    () => resolveCassidyWorldPresence(languageCode, context),
    [languageCode, context]
  );
  const anchor = useMemo(
    () => resolveCassidySceneAnchor(languageCode, context),
    [languageCode, context]
  );
  const [open, setOpen] = useState(
    context === 'confused' || context === 'learning' || context === 'success'
  );

  useEffect(() => {
    if (context === 'confused' || context === 'learning' || context === 'success') {
      setOpen(true);
    }
  }, [context, languageCode]);

  if (!presence.visible) return null;

  const speaking = open && (
    context === 'learning' || context === 'confused' || context === 'success'
  );
  const flip = anchor.facing === 'left' ? [{ scaleX: -1 }] : undefined;

  return (
    <View
      className="absolute z-[35] items-center"
      style={{ left: anchor.left, top: anchor.top }}
      pointerEvents="box-none"
    >
      {open && presence.line && (
        <View className="mb-1 w-56 rounded-[22px] border border-emerald-200/15 bg-slate-950/92 px-3 py-2 shadow-xl">
          <Pressable
            accessibilityLabel="Close Cassidy message"
            onPress={() => setOpen(false)}
            className="absolute right-2 top-2 h-6 w-6 items-center justify-center"
          >
            <X size={13} color="#94a3b8" />
          </Pressable>
          <Text className="pr-6 text-[9px] font-bold uppercase tracking-[1.6px] text-emerald-300">
            Cassidy{locationLabel ? ` · ${locationLabel}` : ''}
          </Text>
          <Text className="mt-1 text-xs leading-5 text-slate-100">{presence.line}</Text>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Talk with Cassidy"
        onPress={() => setOpen((value) => !value)}
        className="items-center"
      >
        <View className="rounded-full border border-emerald-200/10 bg-slate-950/10 px-1 pt-1">
          <View style={{ transform: flip }}>
            <CassidyCharacter
              height={anchor.height}
              action={anchor.action}
              speaking={speaking}
              expression={presence.mood}
            />
          </View>
        </View>
        {!open && context !== 'quiet' && (
          <View className="absolute -right-2 top-1 h-7 w-7 items-center justify-center rounded-full border border-emerald-200/20 bg-emerald-500/20">
            <MessageCircle size={13} color="#a7f3d0" />
          </View>
        )}
      </Pressable>
    </View>
  );
}
