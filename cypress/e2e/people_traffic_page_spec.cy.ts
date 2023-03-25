describe('People traffic page', () => {
	it('successfully loads', () => {
		cy.visit('http://localhost:8080');

		cy.contains('Страница визуализации моделирования эвакуации').click();

		cy.url().should('contain', '/peopleTraffic');
	});
});
