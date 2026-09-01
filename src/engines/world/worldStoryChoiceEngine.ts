export type StoryChoice={id:string;label:string;nextNodeId?:string;effects?:Record<string,number>};
export type StoryNode={id:string;title:string;text:string;choices:StoryChoice[];terminal?:boolean};
export type StoryState={nodeId:string;history:string[];flags:Record<string,number>;completed:boolean};

export const createStoryState=(startNodeId:string):StoryState=>({nodeId:startNodeId,history:[],flags:{},completed:false});

export function chooseStoryOption(state:StoryState,node:StoryNode,choice:StoryChoice):StoryState{
 if(!node.choices.some(item=>item.id===choice.id))return state;
 const flags={...state.flags};
 for(const[key,value]of Object.entries(choice.effects??{}))flags[key]=(flags[key]??0)+value;
 const history=[...state.history,choice.id];
 return{nodeId:choice.nextNodeId??node.id,history,flags,completed:choice.nextNodeId===undefined||node.terminal===true};
}

export function hasChosen(state:StoryState,choiceId:string){return state.history.includes(choiceId)}
export function resetStory(startNodeId:string){return createStoryState(startNodeId)}
