const Page = require('./helpers/page');

let page;
beforeEach(async() => {
  page = await Page.build();
  await page.goto("http://localhost:3000")
}, 8000);

afterEach(async () => {
  await page.close();
});

test('The header has the correct text', async () => {
  const headerText = await page.getContentsOf('a.brand-logo');
  expect(headerText).toBe('Blogster');
})

test("When signed in, check logout button", async () => {
  await page.login();
  const logoutText = await page.getContentsOf('a[href="/auth/logout"]');
  expect(logoutText).toBe('Logout');
});

