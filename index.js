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

app.listen(port, () => console.log('Server running...'))
