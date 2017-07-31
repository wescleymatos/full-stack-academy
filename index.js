require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mongoUri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@meu-dinheiro-shard-00-00-qcut3.mongodb.net:27017,meu-dinheiro-shard-00-01-qcut3.mongodb.net:27017,meu-dinheiro-shard-00-02-qcut3.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=meu-dinheiro-shard-0&authSource=admin`;

const path = require('path');
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

const CalculadoraService = require('./src/services/calculadora.service');
const BaseRepository = require('./src/repositories/base.repository');


app.set('port', (process.env.PORT || port));

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));

//onde estão os templates
app.set('views', path.join(__dirname, 'views'));
//tipo de template
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home');
});


app.get('/calculadora', (req, res) => {
    let calculadoraService = new CalculadoraService();
    const resultado = {
        calculado: false,
        evolucao: []
    };

    if (req.query.valorInicial && req.query.taxa && req.query.tempo) {
        resultado.calculado = true;
        resultado.total = calculadoraService.juros(
            parseFloat(req.query.valorInicial),
            parseFloat(req.query.taxa) / 100,
            parseInt(req.query.tempo)
        );

        resultado.evolucao = calculadoraService.evolucao(
            parseFloat(req.query.valorInicial),
            parseFloat(req.query.taxa) / 100,
            parseInt(req.query.tempo)
        );
    }

    res.render('calculadora', { resultado });
});

app.get('/operacoes/delete/:id', async (req, res) => {
    let baseRepository = new BaseRepository(app.db, 'operacoes');
    const documentId = new ObjectID( req.params.id );
    const operacoes = await baseRepository.remove(documentId);

    res.redirect('/operacoes');
});

app.get('/operacoes/edit/:id', async (req, res) => {
    let baseRepository = new BaseRepository(app.db, 'operacoes');
    const documentId = new ObjectID( req.params.id );
    const operacoes = await baseRepository.find({_id: documentId});

    if (operacoes.length === 0) {
        res.redirect('operacoes');
    } else {
        res.render('edit-operacoes', { operacao: operacoes[0] });
    }
});

app.post('/operacoes/edit/:id', async (req, res) => {
    let baseRepository = new BaseRepository(app.db, 'operacoes');
    const documentId = new ObjectID( req.params.id );
    const operacoes = await baseRepository.find({_id: documentId});

    if (operacoes.length === 0) {
        res.redirect('operacoes');
    } else {
        const operacoes = await baseRepository.update(documentId, req.body);
        res.redirect('/operacoes');
    }
});

app.get('/operacoes', async (req, res) => {
    let calculadoraService = new CalculadoraService();
    let baseRepository = new BaseRepository(app.db, 'operacoes');
    let conditions = {};

    if (req.query.tipo && req.query.tipo === 'entradas') {
        conditions = {
            valor: { $gt: 0 }
        };
    } else if(req.query.tipo && req.query.tipo === 'saidas') {
        conditions = {
            valor: { $lt: 0 }
        };
    }

    const operacoes = await baseRepository.find(conditions);
    const novasOperacoes = calculadoraService.subtotal(operacoes);

    res.render('operacoes', { operacoes: novasOperacoes });
});

app.get('/nova-operacao', (req, res) => res.render('nova-operacao'));

app.post('/nova-operacao', async (req, res) => {
    let baseRepository = new BaseRepository(app.db, 'operacoes');
    const operacao = {
        descricao: req.body.descricao,
        valor: parseFloat(req.body.valor)
    };
    const novaOperacao = await baseRepository.insert(operacao);

    res.redirect('/operacoes');
});


MongoClient.connect(mongoUri, (err, db) => {
    if (err) {
        return;
    }

    app.db = db;
    app.listen(app.get('port'), () => console.log('Server running...'));
});
