//  DEPENDENCIAS
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const port = 80;

// CONSTANTES
const ML_BASE_URL = 'https://api.mercadolibre.com/';
const ML_SEARCH_API = 'sites/MLA/search';
const ML_ITEM_DETAIL_API = 'items/';
const ML_ITEM_DESCRIPTION_API = '/description/';
const ML_CATEGORIES_API = 'categories/';
const AUTHOR = {
    name: 'Oscar Andrés',
    lastname: 'Casallas Moreno'
}

// INICIALIZACION
const app = express();
app.use(cors())


app.get('/api/items', (req, res) => {
    let params = new URLSearchParams([['q', req.query.q]]);
    axios.get(ML_BASE_URL + ML_SEARCH_API, {params}).then((response) => {
        res.send({
            author: AUTHOR,
            categories:  response.data.available_filters.find(
                    filter  => filter.id ===  "category"
                ) ? response.data.available_filters.find(
                    filter  => filter.id ===  "category"
                ).values.sort(
                    (a,b) => a.results < b.results ? 1 : a.results > b.results ? -1 : 0).slice(0,5).map(
                        category => category.name
                    ) : response.data.filters.find(
                            filter  => filter.id ===  "category"
                        ).values.find( e => true).path_from_root.map(
                            category => category.name
                ),
            items: response.data.results.slice(0,4).map(
                item => {
                    return {
                        id: item.id,
                        title: item.title,
                        price: {
                            currency: item.currency_id,
                            amount: Math.floor(item.price),
                            decimals: Math.ceil((item.price - Math.floor(item.price)) * 100)
                        },
                        address: item.address.state_name,
                        picture: item.thumbnail,
                        condition: item.condition,
                        free_shipping: item.shipping.free_shipping
                    }
                }),
        });
    }).catch((err) => {
        console.log(err);
        res.sendStatus(err.response.status)
    });
});

app.get('/api/items/:id', (req, res) => {
    axios.get(ML_BASE_URL + ML_ITEM_DETAIL_API + req.params.id).then((response) => {
        axios.get(ML_BASE_URL + ML_ITEM_DETAIL_API + req.params.id + ML_ITEM_DESCRIPTION_API).then(
            (description) => {
                axios.get(ML_BASE_URL + ML_CATEGORIES_API + response.data.category_id).then(
                    (category) => {
                        console.log(category.data)
                        res.send({
                            AUTHOR,
                            id: response.data.id,
                            title: response.data.title,
                            price: {
                                currency: response.data.currency_id,
                                amount:  Math.floor(response.data.price),
                                decimals: Math.ceil((response.data.price - Math.floor(response.data.price)) * 100)
                            },
                            picture: response.data.thumbnail,
                            condition: response.data.condition,
                            free_shiping: response.data.shipping.free_shiping,
                            sold_quantity: response.data.sold_quantity,
                            categories: category.data.path_from_root.map(cat => cat.name),
                            description: description.data.plain_text
                        })
                }).catch((categoryErr) =>{
                    console.log(descriptionErr);
                    res.sendStatus(categoryErr.response.status);
                });
            }).catch((descriptionErr) =>{
                console.log(descriptionErr);
                res.sendStatus(descriptionErr.response.status);
            });
        
    }).catch(err =>{
        console.log(err);
        res.sendStatus(err.response.status)
    });
});

app.listen(port, () =>  {
    console.log('Express started on port ' + port);
});