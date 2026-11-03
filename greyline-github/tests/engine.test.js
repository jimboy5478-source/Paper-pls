import assert from 'node:assert/strict';
import { generateDayEntrants, getViolations, evaluateDecision, applyDailyFamily, createNewSave } from '../src/game/engine.js';
import { CAMPAIGN_DAYS } from '../src/game/data.js';

let peopleCount = 0;
let invalidCount = 0;
for (let day = 1; day <= CAMPAIGN_DAYS; day += 1) {
  const people = generateDayEntrants(day);
  assert.equal(people.length, 7 + Math.floor((day - 1) / 4), `day ${day} queue size`);
  assert.equal(getViolations(people[0], day).length, 0, `day ${day} first entrant should be valid`);
  for (const person of people) {
    peopleCount += 1;
    const violations = getViolations(person, day);
    const actualValid = violations.length === 0;
    if (!actualValid) invalidCount += 1;
    assert.equal(actualValid, person.intendedValid, `day ${day} ${person.id} (${person.injectedViolation || 'valid'}) mismatch: ${JSON.stringify(violations)}`);
    assert.equal(evaluateDecision(person, actualValid ? 'approve' : 'deny', day).correct, true);
    assert.equal(evaluateDecision(person, actualValid ? 'deny' : 'approve', day).correct, false);
  }
  const deterministic = JSON.stringify(generateDayEntrants(day)) === JSON.stringify(people);
  assert.ok(deterministic, `day ${day} generation should be deterministic`);
}
const save = createNewSave();
assert.equal(save.day, 1);
assert.equal(save.family.length, 3);
const family = applyDailyFamily(save.family, { food: true, heat: true, medicine: true });
assert.ok(family.every((member) => member.health > 0));
console.log(`Engine OK: ${peopleCount} entrants, ${invalidCount} invalid cases, ${CAMPAIGN_DAYS} days.`);
