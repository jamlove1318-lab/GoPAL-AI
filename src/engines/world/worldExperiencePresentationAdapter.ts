import type { WorldExperiencePresentation } from './worldExperienceDirector';

export type WorldExperienceViewModel={cameraMode:'establishing'|'face-to-face'|'departure-follow'|'world';showResident:boolean;residentAnimation:'idle'|'warm'|'gesturing'|'thinking'|'working';showLearnerInput:boolean;allowTyping:boolean;allowSpeaking:boolean;ambientEventId:string|null;phase:WorldExperiencePresentation['phase']};

export function toWorldExperienceViewModel(presentation:WorldExperiencePresentation):WorldExperienceViewModel{return {cameraMode:presentation.cameraMode,showResident:presentation.residentVisible,residentAnimation:presentation.residentMotion,showLearnerInput:presentation.input==='typing-and-speaking',allowTyping:presentation.input==='typing-and-speaking',allowSpeaking:presentation.input==='typing-and-speaking',ambientEventId:presentation.event?.id??null,phase:presentation.phase};}

export const worldExperiencePresentationAdapter={toViewModel:toWorldExperienceViewModel};
