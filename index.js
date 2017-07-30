require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mongoUri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@meu-dinheiro-shard-00-00-qcut3.mongodb.net:27017,meu-dinheiro-shard-00-01-qcut3.mongodb.net:27017,meu-dinheiro-shard-00-02-qcut3.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=meu-dinheiro-shard-0&authSource=admin`;

const path = require('path');
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

// Meus imports
const CalculadoraService = require('./src/services/calculadora.service');


const find = (db, collectionName, conditions) => {
    const collection = db.collection(collectionName);
    const cursor = collection.find(conditions);
    const documents = [];

    return new Promise((resolve, reject) => {
        cursor.forEach(
            (doc) => documents.push((doc)),
            () => resolve(documents)
        )
    });
}

const insert = (db, collectionName, document) => {
    const collection = db.collection(collectionName);

    return new Promise((resolve, reject) => {
        collection.insert(document, (err, doc) => {
            if (err) {
                reject(err);
            } else {
                resolve(doc);
            }
        })
    });
}

const remove  = (db, collectionName, documentId) => {
    const collection = db.collection(collectionName);

    return new Promise((resolve, reject) => {
        collection.deleteOne({ _id: new ObjectID( documentId ) }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    });
}

const update = (db, collectionName, id, values) => {
    const collection = db.collection(collectionName);

    return new Promise((resolve, reject) => {
        collection.updateOne(
            { _id: new ObjectID( id ) },
            { $set: values },
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        )
    });
}
// end functions

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
    const operacoes = await remove(app.db, 'operacoes', req.params.id);

    res.redirect('/operacoes');
});

app.get('/operacoes/edit/:id', async (req, res) => {
    const operacoes = await find(app.db, 'operacoes', {
        _id: new ObjectID( req.params.id )
    })

    if (operacoes.length === 0) {
        res.redirect('operacoes');
    } else {
        res.render('edit-operacoes', { operacao: operacoes[0] });
    }
});

app.post('/operacoes/edit/:id', async (req, res) => {
    const operacoes = await find(app.db, 'operacoes', {
        _id: new ObjectID( req.params.id )
    });

    if (operacoes.length === 0) {
        res.redirect('operacoes');
    } else {
        const operacoes = await update(app.db, 'operacoes', req.params.id, req.body);
        res.redirect('/operacoes');
    }
});

app.get('/operacoes', async (req, res) => {
    let calculadoraService = new CalculadoraService();
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

    const operacoes = await find(app.db, 'operacoes', conditions);
    const novasOperacoes = calculadoraService.subtotal(operacoes);

    res.render('operacoes', { operacoes: novasOperacoes });
});

app.get('/nova-operacao', (req, res) => res.render('nova-operacao'));

app.post('/nova-operacao', async (req, res) => {
    const operacao = {
        descricao: req.body.descricao,
        valor: parseFloat(req.body.valor)
    };
    const novaOperacao = await insert(app.db, 'operacoes', operacao);

    res.redirect('/operacoes');
});


MongoClient.connect(mongoUri, (err, db) => {
    if (err) {
        return;
    }

    app.db = db;
    app.listen(app.get('port'), () => console.log('Server running...'));
});
