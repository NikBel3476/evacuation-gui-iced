describe('Configuration page', () => {
	it('successfully loads', () => {
		cy.visit('http://localhost:8080');

		cy.contains('Страница конфигурации').click();

		cy.url().should('contain', '/configuration');
	});
});
