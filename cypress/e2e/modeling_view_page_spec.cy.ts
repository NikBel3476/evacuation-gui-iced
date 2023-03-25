describe('Modeling view page', () => {
	it('successfully loads', () => {
		cy.visit('http://localhost:8080');

		cy.contains('Страница визуализации моделирования(Pixi.js)').click();

		cy.url().should('contain', '/modelingView');
	});
});
