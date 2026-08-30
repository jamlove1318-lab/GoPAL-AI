import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MessageCircle, X } from 'lucide-react-native';
import { CassidyCharacter } from '../../../components/CassidyCharacter';
import {
  CassidyPresenceContext,
  resolveCassidyWorldPresence,
} from '../../../engines/cassidy/cassidyWorldPresenceEngine';

interface Props {
  languageCode?: string;
  context?: CassidyPresenceContext;
  locationLabel?: string;
}

/**
 * Cassidy's in-world body. This deliberately lives inside the scene rather
 * than as a permanent floating assistant button. Future language worlds can
 * reuse the same presence with their own context and position.
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
  const [open, setOpen] = useState(context === 'confused' || context === 'learning' || context === 'success');

  useEffect(() => {
    if (context === 'confused' || context === 'learning' || context === 'success') {
      setOpen(true);
    }
  }, [context, languageCode]);

  if (!presence.visible) return null;

  const speaking = open && presence.line !== null;
  const action = context === 'success' ? 'waving' : context === 'exploring' ? 'walking' : 'idle';

  return (
    <View className="absolute left-[16%] top-[48%] z-[35] items-center" pointerEvents="box-none">
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
        <View className="rounded-full border border-emerald-200/10 bg-slate-950/15 px-1 pt-1">
          <CassidyCharacter
            height={92}
            action={action}
            speaking={speaking}
            expression={presence.mood}
          />
        </View>
        {!open && (
          <View className="absolute -right-2 top-1 h-7 w-7 items-center justify-center rounded-full border border-emerald-200/20 bg-emerald-500/20">
            <MessageCircle size={13} color="#a7f3d0" />
          </View>
        )}
      </Pressable>
    </View>
  );
}
