describe('example', () => {
	it('should be passed', async () => {
		const header = await $('body > div > main > header > h1');
		const text = await header.getText();
		expect(text).toMatch(/^Main page/);
	});

	it('should be failed', async () => {
		const header = await $('body > div > main > header > h1');
		const text = await header.getText();
		expect(text).toMatch(/!$/);
	});
});
