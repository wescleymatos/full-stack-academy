class CalculadoraService {
    constructor() {
        this.evolucao = this.evolucao.bind(this);
    }

    juros(p, i, n) {
        return p * Math.pow(1 + i, n);
    }

    evolucao(p, i, n) {
        return Array.from(new Array(n), (n, i) => i + 1).map( mes => {
                    return {
                        mes,
                        juros: this.juros(p, i, mes)
                    }
                });
    }

    subtotal(operacoes) {
        let sub = 0;

        return operacoes.map(operacao => {
            sub += parseFloat(operacao.valor);
            let novaOperacao = {
                _id: operacao._id,
                valor: operacao.valor,
                descricao: operacao.descricao,
                sub: sub
            };

            return novaOperacao;
        });
    }

}

module.exports = CalculadoraService;
