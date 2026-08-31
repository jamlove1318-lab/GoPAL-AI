export type WordBankAnswer={answer:string;usedWordIndexes:number[];isComplete:boolean};
export function buildWordBankAnswer(words:string[],usedWordIndexes:number[]):WordBankAnswer{const indexes=usedWordIndexes.filter(index=>index>=0&&index<words.length);return{answer:indexes.map(index=>words[index]).join(' ').trim(),usedWordIndexes:indexes,isComplete:indexes.length>0};}
export function getRemainingWordIndexes(words:string[],usedWordIndexes:number[]){const used=new Set(usedWordIndexes);return words.map((_,index)=>index).filter(index=>!used.has(index));}
export function resetWordBankAnswer():WordBankAnswer{return{answer:'',usedWordIndexes:[],isComplete:false};}
export const wordBankAnswerEngine={build:buildWordBankAnswer,remaining:getRemainingWordIndexes,reset:resetWordBankAnswer};
