/* Compasso · Adaptadores do domínio canônico de execução */
const executionSessionModel=globalThis.CompassoExecutionSessionModel;
const executionRuntime={tabId:`execution-${Date.now()}-${Math.random().toString(36).slice(2)}`,leaseKey:'compasso.execution.lease.v1'};
state.data.executionSessions=executionSessionModel.migrate(state.data);
function executionLease(){try{return JSON.parse(localStorage.getItem(executionRuntime.leaseKey)||'{}')}catch{return{}}}
function executionClaim(session){const lease=executionLease();if(!executionSessionModel.leaseAvailable(lease,executionRuntime.tabId))return false;localStorage.setItem(executionRuntime.leaseKey,JSON.stringify({tabId:executionRuntime.tabId,sessionId:session?.id||null,updatedAt:Date.now()}));return true;}
function executionRelease(){const lease=executionLease();if(lease.tabId===executionRuntime.tabId)localStorage.removeItem(executionRuntime.leaseKey);}
function executionSyncAll(){state.data.executionSessions=executionSessionModel.migrate(state.data);return state.data.executionSessions;}
function executionSyncRegular(session){state.data.executionSessions=executionSessionModel.upsert(state.data.executionSessions,executionSessionModel.fromRegular(session));const active=executionSessionModel.active(state.data.executionSessions);if(active)executionClaim(active);else executionRelease();return active;}
function executionSyncDeep(session){state.data.executionSessions=executionSessionModel.upsert(state.data.executionSessions,executionSessionModel.fromDeep(session));const active=executionSessionModel.active(state.data.executionSessions);if(active)executionClaim(active);else executionRelease();return active;}
function executionActive(){executionSyncAll();const active=executionSessionModel.active(state.data.executionSessions);if(active)executionClaim(active);else executionRelease();return active;}
function executionCanStart(){const active=executionActive();return !active&&executionSessionModel.leaseAvailable(executionLease(),executionRuntime.tabId);}
function completedExecutionSessions(domain='all'){executionSyncAll();return executionSessionModel.history(state.data.executionSessions,domain);}
