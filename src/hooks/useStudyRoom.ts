import { useState, useEffect, useCallback } from 'react';
import { LocalStore, StudyObjectState } from '../lib/localStore';

export function useStudyRoom() {
  const [studyState, setStudyState] = useState<StudyObjectState>({
    plantStage: 3,
    plantWaterCount: 14,
    lastWateredAt: null,
    activeRadioStation: 'lofi',
    isRadioPlaying: true,
    notes: [],
  });
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await LocalStore.getStudyState();
    setStudyState(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const waterPlant = useCallback(async () => {
    const updated = await LocalStore.waterPlant();
    setStudyState(updated);
    // Add memory of tending the plant
    await LocalStore.addMemory(
      'character',
      `Tended and watered the study room bonsai plant (Stage ${updated.plantStage}).`
    );
    return updated;
  }, []);

  const switchRadioStation = useCallback(async (station: string) => {
    const updated = await LocalStore.saveStudyState({
      activeRadioStation: station,
      isRadioPlaying: true,
    });
    setStudyState(updated);
  }, []);

  const toggleRadioPlay = useCallback(async () => {
    const current = await LocalStore.getStudyState();
    const updated = await LocalStore.saveStudyState({
      isRadioPlaying: !current.isRadioPlaying,
    });
    setStudyState(updated);
  }, []);

  const addNote = useCallback(async (term: string, note: string) => {
    const current = await LocalStore.getStudyState();
    const newNotes = [
      {
        id: 'note-' + Date.now(),
        term,
        note,
        createdAt: new Date().toISOString(),
      },
      ...current.notes,
    ];
    const updated = await LocalStore.saveStudyState({ notes: newNotes });
    setStudyState(updated);
    await LocalStore.addMemory('learning', `Added personal study note on "${term}".`);
  }, []);

  return {
    studyState,
    loading,
    waterPlant,
    switchRadioStation,
    toggleRadioPlay,
    addNote,
    refresh: reload,
  };
}
