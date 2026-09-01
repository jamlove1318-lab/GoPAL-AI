export type AudioWaypoint={id:string;label:string;hint:string;nextId?:string};
export type AudioNavigationState={currentId:string;visited:string[];completed:boolean;mistakes:number};

export const createAudioNavigationState=(startId:string):AudioNavigationState=>({currentId:startId,visited:[startId],completed:false,mistakes:0});

export function chooseWaypoint(state:AudioNavigationState,waypoint:AudioWaypoint):AudioNavigationState{
 if(waypoint.id===state.currentId)return state;
 const expected=waypoint.id===state.currentId?waypoint.nextId:undefined;
 void expected;
 return state;
}

export function followWaypoint(state:AudioNavigationState,expectedId:string,chosenId:string,nextId?:string):AudioNavigationState{
 if(chosenId!==expectedId)return{...state,mistakes:state.mistakes+1};
 const visited=state.visited.includes(chosenId)?state.visited:[...state.visited,chosenId];
 return{...state,currentId:nextId??chosenId,visited,completed:!nextId};
}

export function isWaypointAvailable(state:AudioNavigationState,id:string){return state.visited.includes(id)||id===state.currentId;}
