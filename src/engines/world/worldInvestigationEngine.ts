export type InvestigationClue={id:string;label:string;detail:string;requires?:string[];reveals?:string[]};
export type InvestigationState={collected:string[];revealed:string[];completed:boolean};

export const createInvestigationState=():InvestigationState=>({collected:[],revealed:[],completed:false});

export function inspectClue(state:InvestigationState,clue:InvestigationClue):InvestigationState{
 const collected=state.collected.includes(clue.id)?state.collected:[...state.collected,clue.id];
 const prerequisites=(clue.requires??[]).every(id=>collected.includes(id));
 const revealed=Array.from(new Set([...state.revealed,...(prerequisites?(clue.reveals??[]):[])]));
 return{...state,collected,revealed};
}

export function isClueAvailable(state:InvestigationState,clue:InvestigationClue){return(clue.requires??[]).every(id=>state.collected.includes(id));}

export function completeInvestigation(state:InvestigationState,requiredClues:string[]):InvestigationState{
 return{...state,completed:requiredClues.every(id=>state.collected.includes(id))};
}

export function resetInvestigation():InvestigationState{return createInvestigationState()}
