(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.CompassoEnergyModel=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const ENERGY_VALUES=['low','medium','high'];
  function valid(value){return ENERGY_VALUES.includes(value)?value:null;}
  function hourAt(startedAt,timezone='UTC'){
    try{
      const parts=new Intl.DateTimeFormat('en-US',{timeZone:timezone,hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date(startedAt));
      return Number(parts.find(part=>part.type==='hour')?.value||0);
    }catch{return new Date(startedAt).getUTCHours();}
  }
  function period(hour){
    if(hour>=5&&hour<12)return'morning';
    if(hour>=12&&hour<18)return'afternoon';
    if(hour>=18)return'evening';
    return'dawn';
  }
  function mode(records,field='energyBefore'){
    const counts={low:0,medium:0,high:0};
    records.forEach(record=>{const value=valid(record[field]);if(value)counts[value]+=1;});
    const ranked=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    if(!ranked[0][1]||(ranked[1]&&ranked[0][1]===ranked[1][1]))return null;
    return ranked[0][0];
  }
  function aggregate(records,minSample=3){
    const keys=['morning','afternoon','evening','dawn'];
    return Object.fromEntries(keys.map(key=>{const rows=records.filter(record=>valid(record.energyBefore)&&period(hourAt(record.startedAt,record.timezone||'UTC'))===key);return[key,{sampleSize:rows.length,sufficient:rows.length>=minSample,mode:rows.length>=minSample?mode(rows):null}];}));
  }
  return{ENERGY_VALUES,valid,hourAt,period,mode,aggregate};
});

