const CalculadoraService = require('../../src/services/calculadora.service');
const expect = require('chai').expect;

describe('Serviço de calculadora', () => {

    it('calcula juros', () => {
        let calculadora = new CalculadoraService();
        let valor = calculadora.juros(1000, 0.01, 1);

        expect(valor).to.equal(1010);
    });

});
