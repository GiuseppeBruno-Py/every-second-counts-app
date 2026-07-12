const test=require('node:test');
const assert=require('node:assert/strict');
const model=require('../energy-model.js');

test('classifies local periods at boundaries',()=>{
  assert.equal(model.period(4),'dawn');
  assert.equal(model.period(5),'morning');
  assert.equal(model.period(12),'afternoon');
  assert.equal(model.period(18),'evening');
});

test('respects the timezone stored on each record',()=>{
  assert.equal(model.hourAt('2026-07-12T12:00:00.000Z','America/Recife'),9);
  assert.equal(model.hourAt('2026-07-12T12:00:00.000Z','UTC'),12);
});

test('returns a unique mode and avoids false patterns on ties',()=>{
  assert.equal(model.mode([{energyBefore:'high'},{energyBefore:'high'},{energyBefore:'low'}]),'high');
  assert.equal(model.mode([{energyBefore:'high'},{energyBefore:'low'}]),null);
});

test('requires the configured minimum sample',()=>{
  const records=[
    {startedAt:'2026-07-12T09:00:00-03:00',timezone:'America/Recife',energyBefore:'high'},
    {startedAt:'2026-07-13T09:00:00-03:00',timezone:'America/Recife',energyBefore:'high'}
  ];
  assert.equal(model.aggregate(records,3).morning.sufficient,false);
  records.push({startedAt:'2026-07-14T09:00:00-03:00',timezone:'America/Recife',energyBefore:'medium'});
  const morning=model.aggregate(records,3).morning;
  assert.equal(morning.sufficient,true);
  assert.equal(morning.sampleSize,3);
  assert.equal(morning.mode,'high');
});

test('ignores invalid or missing energy instead of treating it as low',()=>{
  assert.equal(model.valid('unknown'),null);
  assert.equal(model.aggregate([{startedAt:new Date().toISOString(),timezone:'UTC'}]).dawn.sampleSize,0);
});

