import { decideCassidyLife, type CassidyLifeInput } from './cassidyLifeEngine';
import { decideCassidyAction, type CassidyAutonomyInput } from './cassidyAutonomyEngine';
import { executeCassidyDecision } from './cassidyActionEngine';

export type CassidyVerificationResult={name:string;passed:boolean;details:string};

function autonomyInput(overrides:Partial<CassidyAutonomyInput>={}):CassidyAutonomyInput{
 return {worldMode:'home',worldId:'emerald-valley',learner:{isExploring:true,needsHelp:false,recentlySucceeded:false},time:{minutesSinceCassidySpoke:20},learnerNeedsHelp:false,learnerRecentlySucceeded:false,learnerIsExploring:true,minutesSinceCassidySpoke:20,...overrides};
}
export function verifyCassidyLifeRules():CassidyVerificationResult[]{
 const base:CassidyLifeInput={worldId:'emerald-valley',hour:12,learnerExploring:false,learnerNeedsHelp:false,minutesSinceInteraction:20,recentSuccess:false};
 const cases:[string,CassidyLifeInput,string][]=[['help has priority',{...base,learnerNeedsHelp:true},'helping'],['success has priority',{...base,recentSuccess:true},'celebrating'],['rain creates quiet behavior',{...base,weather:'rain'},'watching-rain'],['late hours become quiet',{...base,hour:23},'stargazing']];
 return cases.map(([name,input,expected])=>{const actual=decideCassidyLife(input,17).activity;return{name,passed:actual===expected,details:`expected ${expected}, got ${actual}`};});
}
export function verifyCassidyAutonomyRules():CassidyVerificationResult[]{
 const base=autonomyInput({weather:'clear',seed:17});
 const cases:[string,CassidyAutonomyInput,string][]=[['help interrupts',{...base,learnerNeedsHelp:true,learner:{...base.learner,needsHelp:true}},'help'],['success celebrates',{...base,learnerRecentlySucceeded:true,learner:{...base.learner,recentlySucceeded:true}},'celebrate'],['recent speech observes',{...base,minutesSinceCassidySpoke:2,time:{minutesSinceCassidySpoke:2}},'observe']];
 return cases.map(([name,input,expected])=>{const actual=decideCassidyAction(input).action;return{name,passed:actual===expected,details:`expected ${expected}, got ${actual}`};});
}
export function verifyCassidyActionMapping():CassidyVerificationResult[]{
 const decision=decideCassidyAction(autonomyInput({learnerIsExploring:false,learner:{isExploring:false,needsHelp:false,recentlySucceeded:false},seed:29}));
 const action=executeCassidyDecision(decision);
 return [{name:'action maps to a stable visual action',passed:['idle','talking','waving','walking'].includes(action.visualAction),details:`visual action ${action.visualAction}`},{name:'life action remains typed',passed:!action.lifeActivity||typeof action.lifeActivity==='string',details:`life activity ${action.lifeActivity??'none'}`}];
}
export function runCassidyDeterministicVerification():CassidyVerificationResult[]{return [...verifyCassidyLifeRules(),...verifyCassidyAutonomyRules(),...verifyCassidyActionMapping()];}
