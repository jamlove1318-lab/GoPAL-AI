export type ActivityContentPack={
 id:string;worldId:string;placeId:string;language:string;title:string;prompt:string;items:string[];correctItem?:string;sequence?:string[];metadata?:Record<string,string|number|boolean>
};

export const createActivityContentPack=(input:ActivityContentPack):ActivityContentPack=>({
 ...input,
 items:[...input.items],
 sequence:input.sequence?[...input.sequence]:undefined,
 metadata:input.metadata?{...input.metadata}:undefined,
});

export function localizeActivityPack(pack:ActivityContentPack,overrides:Partial<Pick<ActivityContentPack,'title'|'prompt'|'items'>>):ActivityContentPack{
 return createActivityContentPack({...pack,...overrides});
}
