const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World! This is Night Out Backend')
})

app.get('/example', (req, res) => {
    res.json({  0: {title: 'example data', url: "https://i.pinimg.com/originals/0f/cc/2e/0fcc2e9cda0178dae940f1c684cd0732.jpg"},
                1: {title: 'item data', url: "https://i2-prod.norfolklive.co.uk/news/norfolk-news/article6888786.ece/ALTERNATES/s810/0_Pepper.jpg"},
                2: {title: 'other data', url: "https://assets.iflscience.com/assets/articleNo/66109/aImg/63250/hope-the-kitten-l.webp"}
    })
})

app.listen(port, () => {
  console.log(`NightOut backend running on port ${port}`)
})