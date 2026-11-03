import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateDayEntrants, evaluateDecision } from '../src/game/engine.js';
import { CAMPAIGN_DAYS } from '../src/game/data.js';

fs.mkdirSync('artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));
const resistanceApprovals = new Set(['greydove', 'whiteelm', 'reporter', 'courier']);
async function drag(locator, dx, dy) {
  const box = await locator.boundingBox();
  await page.mouse.move(box.x + 3, box.y + 3);
  await page.mouse.down();
  await page.mouse.move(box.x + dx, box.y + dy, { steps: 6 });
  await page.mouse.up();
}
try {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /開始新的戰役/ }).click();
  for (let day = 1; day <= CAMPAIGN_DAYS; day += 1) {
    await page.waitForSelector('.briefing-screen');
    assert.match(await page.locator('.briefing-title h1').textContent(), /.+/);
    await page.getByRole('button', { name: /拉開窗板/ }).click();
    await page.waitForSelector('.game-shell');
    const people = generateDayEntrants(day);
    if (day === 1) {
      await page.waitForTimeout(1400);
      assert.equal(await page.locator('.document').count(), 1, 'day 1 should only require passport');
      assert.equal(await page.locator('.transcript-paper').count(), 1);
      await page.getByRole('button', { name: '手冊', exact: true }).click();
      await page.waitForSelector('.open-handbook');
      await page.getByRole('button', { name: '關閉桌面手冊' }).click();
      const doc = page.locator('.document-passport');
      const before = await doc.boundingBox();
      await drag(doc, 95, 120);
      const after = await doc.boundingBox();
      assert.ok(Math.abs(after.x - before.x) > 30, 'document should drag');
    }
    if ([7, 15].includes(day)) { await page.waitForTimeout(1300); await page.screenshot({ path: `artifacts/redesign-day-${day}.png`, fullPage: true }); }
    for (let index = 0; index < people.length; index += 1) {
      const person = people[index];
      await page.waitForFunction((expected) => document.querySelector('.transcript-meta span')?.textContent.endsWith(expected), `#${String(index + 1).padStart(3, '0')}`);
      if (day === 3 && index === 1) {
        await page.waitForTimeout(1250);
        await drag(page.locator('.document-permit'), 300, 50);
        await page.keyboard.press('q');
        await page.locator('.document-passport .doc-field').filter({ hasText: '姓名 / NAME' }).click();
        await page.locator('.document-permit .doc-field').filter({ hasText: '持有人' }).click();
        assert.match(await page.locator('.inspection-controls > p').textContent(), /矛盾/);
        await page.locator('.interrogate-button').click();
        assert.ok((await page.locator('.transcript-line.interrogation').count()) >= 2);
        await page.keyboard.press('q');
      }
      if (person.bribe && day === 5) await page.locator('.bribe-button').click();
      const result = evaluateDecision(person, 'approve', day);
      const action = resistanceApprovals.has(person.specialKey) ? 'approve' : result.shouldApprove ? 'approve' : 'deny';
      await page.locator(`.stamp-button.${action}`).click();
      await page.waitForSelector('.physical-decision-slip');
      if (index === 0 && day === 1) await page.screenshot({ path: 'artifacts/redesign-decision.png', fullPage: true });
      await page.waitForTimeout(2050);
    }
    await page.waitForSelector('.dayend-screen');
    if (day === 1) await page.screenshot({ path: 'artifacts/redesign-dayend.png', fullPage: true });
    const nightOptions = page.locator('.night-options button');
    if (await nightOptions.count()) {
      let optionIndex = 0;
      if (day === 10) optionIndex = 1;
      if (day === 13 && await nightOptions.nth(0).isDisabled()) optionIndex = 1;
      await nightOptions.nth(optionIndex).click();
    }
    await page.locator('.night-panel > .primary-button').click();
    if (day < CAMPAIGN_DAYS) {
      await page.waitForSelector('.briefing-screen');
      if (day === 1) {
        await page.reload({ waitUntil: 'networkidle' });
        await page.getByRole('button', { name: /繼續第 2 日/ }).click();
      }
    }
    console.log(`Day ${day} complete`);
  }
  await page.waitForSelector('.final-choice-screen');
  const resistance = page.locator('.final-options > button').nth(1);
  assert.equal(await resistance.isDisabled(), false, 'resistance route should be unlocked');
  await resistance.click();
  await page.waitForSelector('.ending-screen');
  assert.equal(await page.locator('.ending-card h1').textContent(), '黎明通道');
  assert.deepEqual(errors, [], 'browser console should have no errors');
  console.log('FULL CAMPAIGN OK', { errors });
} finally {
  await browser.close();
}
