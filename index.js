require('dotenv').config()

const MongoClient = require('mongodb').MongoClient
const mongoUri = `mongodb://admin:VuOd3VKlZCpBVLYQ@meu-dinheiro-shard-00-00-qcut3.mongodb.net:27017,meu-dinheiro-shard-00-01-qcut3.mongodb.net:27017,meu-dinheiro-shard-00-02-qcut3.mongodb.net:27017/meu-dinheiro?ssl=true&replicaSet=meu-dinheiro-shard-0&authSource=admin`

const path = require('path')
const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')


// functions
const calculaJuros = (p, i, n) => p*Math.pow(1 + i, n)

const findAll = (db, collectionName) => {
    const collection = db.collection(collectionName)
    const cursor = collection.find({})
    const documents = []

    return new Promise((resolve, reject) => {
        cursor.forEach(
            (doc) => documents.push((doc)),
            () => resolve(documents)
        )
    })
}

const insert = (db, collectionName, document) => {
    const collection = db.collection(collectionName)

    return new Promise((resolve, reject) => {
        collection.insert(document, (err, doc) => {
            if (err) {
                reject(err)
            } else {
                resolve(doc)
            }
        })
    })
}
// end functions


app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public'))

//onde estão os templates
app.set('views', path.join(__dirname, 'views'))
//tipo de template
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('home')
})


app.get('/calculadora', (req, res) => {
    const resultado = {
        calculado: false
    }
    if (req.query.valorInicial && req.query.taxa && req.query.tempo) {
        resultado.calculado = true
        resultado.total = calculaJuros(
            parseFloat(req.query.valorInicial),
            parseFloat(req.query.taxa) / 100,
            parseInt(req.query.tempo)
        )
    }

    res.render('calculadora', { resultado })
})

app.get('/operacoes', async (req, res) => {
    const operacoes = await findAll(app.db, 'operacoes')

    //res.render('operacoes', { operacoes })
    res.send(operacoes)
})

app.get('/nova-operacao', (req, res) => res.render('nova-operacao'))

app.post('/nova-operacao', async (req, res) => {
    const operacao = {
        descricao: req.body.descricao,
        valor: parseFloat(req.body.valor)
    }
    const novaOperacao = await insert(app.db, 'operacoes', operacao)

    res.redirect('/operacoes')
})


MongoClient.connect(mongoUri, (err, db) => {
    if (err) {
        return
    }

    app.db = db
    app.listen(port, () => console.log('Server running...'))
})
