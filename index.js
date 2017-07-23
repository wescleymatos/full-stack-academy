const MongoClient = require('mongodb').MongoClient
const mongoUri = 'mongodb://admin:VuOd3VKlZCpBVLYQ@meu-dinheiro-shard-00-00-qcut3.mongodb.net:27017,meu-dinheiro-shard-00-01-qcut3.mongodb.net:27017,meu-dinheiro-shard-00-02-qcut3.mongodb.net:27017/meu-dinheiro?ssl=true&replicaSet=meu-dinheiro-shard-0&authSource=admin'

const path = require('path')
const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'))

//onde estão os templates
app.set('views', path.join(__dirname, 'views'))
//tipo de template
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('home')
})

const calculaJuros = (p, i, n) => p*Math.pow(1 + i, n)

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

app.get('/operacoes', async (req, res) => {
    const operacoes = await findAll(app.db, 'operacoes')

    res.render('operacoes', { operacoes })
})

app.get('/nova-operacao', (req, res) => res.render('nova-operacao'))


MongoClient.connect(mongoUri, (err, db) => {
    if (err) {
        return
    }

    app.db = db
    app.listen(port, () => console.log('Server running...'))

    // const operacao = {
    //     descricao: 'Salário',
    //     valor: 1000
    // }
    // const operacoes = db.collection('operacoes')
    // operacoes.insert(operacao, (err, res) => {
    //     console.log(res)
    // })
})
