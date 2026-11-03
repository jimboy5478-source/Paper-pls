import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createNewSave, evaluateDecision, generateDayEntrants } from '../src/game/engine.js';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));
async function drag(locator, dx, dy, corner = false) {
  const box = await locator.boundingBox();
  await page.mouse.move(box.x + (corner ? 3 : 30), box.y + (corner ? 3 : 15));
  await page.mouse.down();
  await page.mouse.move(box.x + dx, box.y + dy, { steps: 7 });
  await page.mouse.up();
}
async function loadDay(day) {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const save = createNewSave(); save.day = day; save.money = 500;
  await page.evaluate((value) => localStorage.setItem('greyline-save-v1', JSON.stringify(value)), save);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: new RegExp(`繼續第 ${day} 日`) }).click();
  await page.getByRole('button', { name: /拉開窗板/ }).click();
  await page.waitForTimeout(1200);
}
async function decideAndWait(action = 'approve') {
  await page.locator(`.stamp-button.${action}`).click();
  await page.waitForTimeout(2070);
}
try {
  await loadDay(3);
  await decideAndWait('approve');
  await page.waitForTimeout(1300);
  await drag(page.locator('.document-permit'), 300, 50, true);
  await page.screenshot({ path: 'artifacts/interaction-day3-drag.png' });
  await page.keyboard.press('q');
  await page.locator('.document-passport .doc-field').filter({ hasText: '姓名 / NAME' }).click();
  await page.locator('.document-permit .doc-field').filter({ hasText: '持有人' }).click();
  assert.match(await page.locator('.inspection-controls > p').textContent(), /矛盾/);
  await page.locator('.interrogate-button').click();
  assert.ok((await page.locator('.transcript-line.interrogation').count()) >= 2);
  console.log('Dialogue comparison and interrogation OK');

  const photoDay = 4;
  const photoPeople = generateDayEntrants(photoDay);
  const photoIndex = photoPeople.findIndex((person) => person.injectedViolation === 'photoMismatch');
  assert.ok(photoIndex > 0);
  await loadDay(photoDay);
  for (let i = 0; i < photoIndex; i += 1) {
    const person = photoPeople[i];
    await decideAndWait(evaluateDecision(person, 'approve', photoDay).shouldApprove ? 'approve' : 'deny');
  }
  await page.waitForTimeout(1300);
  await drag(page.locator('.document-passport'), 160, 330, true);
  await page.keyboard.press('q');
  await page.locator('.booth-portrait-button').click();
  await page.locator('.document-passport .doc-field').filter({ hasText: '照片' }).click();
  assert.match(await page.locator('.inspection-controls > p').textContent(), /矛盾/);
  await page.locator('.interrogate-button').click();
  await page.locator('.fingerprint-button').click();
  assert.equal(await page.locator('.document-fingerprint').count(), 1);
  assert.match(await page.locator('.fingerprint-result').textContent(), /不相符/);
  console.log('Photo interrogation and fingerprint OK');

  await loadDay(9);
  await decideAndWait('approve');
  await page.locator('.stamp-button.detain').click();
  await page.waitForSelector('.physical-decision-slip.correct');
  console.log('Detention OK');
  assert.deepEqual(errors, []);
  console.log('ALL INTERACTIONS OK');
} finally {
  await browser.close();
}
